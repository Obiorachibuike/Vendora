/**
 * AI Supplier Selection Engine (Module E).
 *
 * Supplier selection is based on structured supplier data and configurable
 * weights — never arbitrary AI guesses. Deterministic scoring.
 */

export interface SupplierOfferScore {
  offerId: string;
  supplierId: string;
  supplierName: string;
  marketplace: string;
  wholesalePrice: number;
  shippingPrice: number;
  totalLandedCost: number;
  deliveryMinDays: number;
  deliveryMaxDays: number;
  stockAvailable: boolean;
  stockQuantity?: number;
  reliabilityScore: number; // 0-100
  rating?: number;          // 0-5
  returnPolicy?: string;
  trackingSupported: boolean;
  score: number;            // 0-100 final
  breakdown: {
    cost: number;           // 0-25
    reliability: number;    // 0-25
    delivery: number;       // 0-20
    stock: number;          // 0-15
    rating: number;         // 0-10
    returnPolicy: number;   // 0-5
  };
  eligible: boolean;
  ineligibilityReason?: string;
}

export interface SupplierSelectionConfig {
  weights: {
    cost: number;        // default 0.25
    reliability: number; // default 0.25
    delivery: number;    // default 0.20
    stock: number;       // default 0.15
    rating: number;      // default 0.10
    returnPolicy: number;// default 0.05
  };
  minMargin?: number;   // fraction, e.g. 0.20
  minProfit?: number;
  maxDeliveryDays?: number;
  requireTracking?: boolean;
}

export const DEFAULT_SELECTION_CONFIG: SupplierSelectionConfig = {
  weights: { cost: 0.25, reliability: 0.25, delivery: 0.20, stock: 0.15, rating: 0.10, returnPolicy: 0.05 },
  minMargin: 0.20,
};

function clamp(value: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Score and rank supplier offers for a product. Returns sorted by score desc.
 * Only eligible offers (in stock, meets delivery, meets min margin) are ranked
 * at the top; ineligible offers are included but flagged.
 */
export function selectSupplier(
  offers: Array<{
    offerId: string;
    supplierId: string;
    supplierName: string;
    marketplace: string;
    wholesalePrice: number;
    shippingPrice: number;
    currency: string;
    deliveryMinDays: number;
    deliveryMaxDays: number;
    stockAvailable: boolean;
    stockQuantity?: number;
    reliabilityScore: number; // 0-100
    rating?: number;          // 0-5
    returnPolicy?: string;
    trackingSupported: boolean;
    lastVerifiedAt?: Date;
  }>,
  config: SupplierSelectionConfig = DEFAULT_SELECTION_CONFIG,
): SupplierOfferScore[] {
  const {
    weights,
    minMargin = 0.20,
    minProfit,
    maxDeliveryDays,
    requireTracking = false,
  } = config;

  const totalWeight =
    weights.cost + weights.reliability + weights.delivery + weights.stock + weights.rating + weights.returnPolicy;

  const costs = offers.map((o) => o.wholesalePrice + o.shippingPrice);
  const minCost = Math.min(...costs, 0);
  const maxCost = Math.max(...costs, minCost + 1);
  const costRange = maxCost - minCost || 1;

  const deliveries = offers.map((o) => o.deliveryMaxDays);
  const minDays = Math.min(...deliveries, 0);
  const maxDays = Math.max(...deliveries, minDays + 1);
  const dayRange = maxDays - minDays || 1;

  const results: SupplierOfferScore[] = offers.map((offer) => {
    const totalLandedCost = offer.wholesalePrice + offer.shippingPrice;

    const costNormalized = 1 - (totalLandedCost - minCost) / costRange;
    const costScore = clamp(costNormalized * 100) * weights.cost;

    const reliabilityScore = clamp(offer.reliabilityScore) * weights.reliability;

    const deliveryNormalized = 1 - (offer.deliveryMaxDays - minDays) / dayRange;
    const deliveryScore = clamp(deliveryNormalized * 100) * weights.delivery;

    const stockScore = (offer.stockAvailable ? 100 : 0) * weights.stock;

    const ratingScore = ((offer.rating ?? 0) / 5) * 100 * weights.rating;

    const returnPolicyScore = (offer.returnPolicy ? 100 : 0) * weights.returnPolicy;

    const score =
      costScore + reliabilityScore + deliveryScore + stockScore + ratingScore + returnPolicyScore;

    let eligible = true;
    let reason: string | undefined;
    if (!offer.stockAvailable) {
      eligible = false;
      reason = "Out of stock";
    } else if (maxDeliveryDays != null && offer.deliveryMaxDays > maxDeliveryDays) {
      eligible = false;
      reason = `Delivery exceeds ${maxDeliveryDays} days`;
    } else if (requireTracking && !offer.trackingSupported) {
      eligible = false;
      reason = "Tracking not supported";
    }

    return {
      offerId: offer.offerId,
      supplierId: offer.supplierId,
      supplierName: offer.supplierName,
      marketplace: offer.marketplace,
      wholesalePrice: offer.wholesalePrice,
      shippingPrice: offer.shippingPrice,
      totalLandedCost,
      deliveryMinDays: offer.deliveryMinDays,
      deliveryMaxDays: offer.deliveryMaxDays,
      stockAvailable: offer.stockAvailable,
      stockQuantity: offer.stockQuantity,
      reliabilityScore: offer.reliabilityScore,
      rating: offer.rating,
      returnPolicy: offer.returnPolicy,
      trackingSupported: offer.trackingSupported,
      score: Math.round(score * 100) / 100,
      breakdown: {
        cost: Math.round(costScore * 100) / 100,
        reliability: Math.round(reliabilityScore * 100) / 100,
        delivery: Math.round(deliveryScore * 100) / 100,
        stock: Math.round(stockScore * 100) / 100,
        rating: Math.round(ratingScore * 100) / 100,
        returnPolicy: Math.round(returnPolicyScore * 100) / 100,
      },
      eligible,
      ineligibilityReason: reason,
    };
  });

  results.sort((a, b) => {
    if (a.eligible && !b.eligible) return -1;
    if (!a.eligible && b.eligible) return 1;
    return b.score - a.score;
  });

  return results;
}

export function pickBestSupplier(
  offers: NonNullable<Parameters<typeof selectSupplier>[0]>,
  config: SupplierSelectionConfig = DEFAULT_SELECTION_CONFIG,
): SupplierOfferScore | null {
  const ranked = selectSupplier(offers, config);
  return ranked.find((r) => r.eligible) ?? null;
}
