/**
 * Automated Pricing Engine (Module G).
 *
 * All calculations are deterministic TypeScript — AI never replaces reliable
 * business logic. Profit includes product cost, shipping, taxes, customs,
 * payment processing fees, advertising, refunds and other configured expenses.
 */

export interface PricingInputs {
  wholesalePrice: number;
  shippingPrice: number;
  currency: string;
  taxRate?: number;            // fraction, e.g. 0.075 for 7.5%
  customsRate?: number;        // fraction
  paymentFeeRate?: number;     // fraction
  paymentFeeFixed?: number;
  advertisingCost?: number;
  refundRate?: number;         // fraction of orders refunded
  otherExpenses?: number;
}

export interface PricingResult {
  wholesalePrice: number;
  shippingPrice: number;
  subtotalCost: number;       // wholesale + shipping
  tax: number;
  customs: number;
  paymentFee: number;
  totalEstimatedCost: number; // landed cost before markup
  advertisingCost: number;
  otherExpenses: number;
  suggestedSellingPrice: number;
  grossProfit: number;        // selling - totalEstimatedCost - advertising - other
  netProfit: number;          // after refunds
  margin: number;             // netProfit / selling
  markupPercent: number;
}

/** Psychological pricing: round to .99 / .95 endings where configured. */
export function psychologicalPrice(value: number): number {
  if (!Number.isFinite(value) || value < 0) return value;
  const floored = Math.floor(value);
  const cents99 = floored + 0.99;
  if (cents99 <= value && cents99 > floored) return cents99;
  const cents95 = floored + 0.95;
  if (cents95 <= value && cents95 > floored) return cents95;
  return floored + 0.99;
}

/**
 * Calculate the full landed cost and a suggested selling price from a markup.
 * If minMargin/minProfit are configured, the selling price is raised to meet
 * them (never sell below configured minimum profitability without authorization).
 */
export function calculatePrice(
  markupType: "FIXED" | "PERCENTAGE",
  markupValue: number,
  inputs: PricingInputs,
  options: {
    psychological?: boolean;
    minProfit?: number;
    minMargin?: number; // fraction
  } = {},
): PricingResult {
  const {
    wholesalePrice,
    shippingPrice,
    taxRate = 0,
    customsRate = 0,
    paymentFeeRate = 0,
    paymentFeeFixed = 0,
    advertisingCost = 0,
    refundRate = 0,
    otherExpenses = 0,
  } = inputs;

  const subtotalCost = wholesalePrice + shippingPrice;
  const tax = subtotalCost * taxRate;
  const customs = subtotalCost * customsRate;

  // Payment processing fee = fixed + rate * (selling price). Solve iteratively
  // because fee depends on selling price which depends on fee. We approximate
  // fee on the pre-fee selling price, then adjust.
  let sellingPrice = 0;
  let totalEstimatedCost = subtotalCost + tax + customs;

  const baseMarkup =
    markupType === "PERCENTAGE"
      ? totalEstimatedCost * (markupValue / 100)
      : markupValue;

  sellingPrice = totalEstimatedCost + baseMarkup;

  // Add advertising + other expenses to cost basis for margin purposes
  const totalCostBasis = totalEstimatedCost + advertisingCost + otherExpenses;

  // Payment fee approx on selling price
  const paymentFee = paymentFeeFixed + sellingPrice * paymentFeeRate;

  // Recompute so fee is included in cost
  totalEstimatedCost = subtotalCost + tax + customs + paymentFee;
  const totalCostBasis2 = totalEstimatedCost + advertisingCost + otherExpenses;

  // Recompute selling with fee included in markup base
  const baseMarkup2 =
    markupType === "PERCENTAGE"
      ? totalEstimatedCost * (markupValue / 100)
      : markupValue;
  sellingPrice = totalEstimatedCost + baseMarkup2;

  // Apply minMargin / minProfit constraints (never sell below minimum)
  let finalPrice = sellingPrice;
  if (options.minMargin != null && options.minMargin > 0) {
    // net = price - totalCostBasis2 - paymentFeeOn(price)
    // require net / price >= minMargin
    const minByMargin =
      totalCostBasis2 / (1 - options.minMargin - paymentFeeRate);
    if (minByMargin > finalPrice) finalPrice = minByMargin;
  }
  if (options.minProfit != null && options.minProfit > 0) {
    const minByProfit = totalCostBasis2 + options.minProfit;
    if (minByProfit > finalPrice) finalPrice = minByProfit;
  }

  if (options.psychological) {
    finalPrice = psychologicalPrice(finalPrice);
  }

  // Recompute final metrics at finalPrice
  const finalPaymentFee = paymentFeeFixed + finalPrice * paymentFeeRate;
  const finalTotalCost =
    subtotalCost + tax + customs + finalPaymentFee + advertisingCost + otherExpenses;
  const grossProfit = finalPrice - (subtotalCost + tax + customs) - advertisingCost - otherExpenses;
  const netProfit = grossProfit - finalPaymentFee;
  const margin = finalPrice > 0 ? netProfit / finalPrice : 0;
  const markupPercent = finalTotalCost > 0 ? ((finalPrice - finalTotalCost) / finalTotalCost) * 100 : 0;

  return {
    wholesalePrice,
    shippingPrice,
    subtotalCost,
    tax,
    customs,
    paymentFee: finalPaymentFee,
    totalEstimatedCost: subtotalCost + tax + customs + finalPaymentFee,
    advertisingCost,
    otherExpenses,
    suggestedSellingPrice: Math.round(finalPrice * 100) / 100,
    grossProfit: Math.round(grossProfit * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    margin: Math.round(margin * 10000) / 10000,
    markupPercent: Math.round(markupPercent * 100) / 100,
  };
}

export function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
