import { z } from "zod";

/* ------------------------------------------------------------------ */
/* AUTH                                                               */
/* ------------------------------------------------------------------ */

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(2, "Currency is required"),
  acceptTerms: z.boolean().refine((v) => v === true, "You must accept the terms"),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(8),
});

/* ------------------------------------------------------------------ */
/* ONBOARDING                                                         */
/* ------------------------------------------------------------------ */

export const onboardingSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  storeName: z.string().min(1, "Store name is required"),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(2, "Currency is required"),
  targetMarket: z.string().optional(),
  preferredCategories: z.array(z.string()).optional(),
  preferredSuppliers: z.array(z.string()).optional(),
  businessModel: z.string().optional(),
  sellingPlatform: z.string().optional(),
  expectedProfitMargin: z
    .string()
    .optional()
    .refine(
      (v) => !v || !isNaN(Number(v)),
      "Expected profit margin must be a number",
    ),
  shippingPreferences: z.string().optional(),
  acceptTerms: z.boolean().optional(),
});

/* ------------------------------------------------------------------ */
/* STORES                                                             */
/* ------------------------------------------------------------------ */

export const storeCreateSchema = z.object({
  name: z.string().min(1, "Store name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase, numbers and hyphens only"),
  country: z.string().min(2, "Country is required"),
  currency: z.string().min(2, "Currency is required"),
  timezone: z.string().default("Africa/Lagos"),
});

export const storeUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  country: z.string().optional(),
  currency: z.string().optional(),
  timezone: z.string().optional(),
  theme: z.string().optional(),
  isPublished: z.boolean().optional(),
});

/* ------------------------------------------------------------------ */
/* PRODUCTS                                                           */
/* ------------------------------------------------------------------ */

export const productCreateSchema = z.object({
  storeId: z.string().uuid("Invalid store"),
  title: z.string().min(1, "Title is required"),
  handle: z.string().min(1, "Handle is required"),
  description: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  basePrice: z.number().positive("Price must be positive"),
  currency: z.string().default("NGN"),
  minMargin: z.number().optional(),
  weight: z.number().optional(),
  tags: z.array(z.string()).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  status: z.enum(["DRAFT", "ACTIVE", "ARCHIVED"]).default("DRAFT"),
});

export const productUpdateSchema = productCreateSchema.partial();

export const productImportSchema = z.object({
  supplierOfferId: z.string().uuid("Invalid supplier offer"),
  storeId: z.string().uuid("Invalid store"),
  variantId: z.string().uuid().optional(),
  title: z.string().optional(),
  basePrice: z.number().positive().optional(),
  autoPublish: z.boolean().default(false),
});

/* ------------------------------------------------------------------ */
/* PRODUCT RESEARCH                                                   */
/* ------------------------------------------------------------------ */

export const productResearchSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  category: z.string().optional(),
  country: z.string().default("NG"),
  targetAudience: z.string().optional(),
  priceRangeMin: z.number().optional(),
  priceRangeMax: z.number().optional(),
  supplier: z.string().optional(),
  shippingPreferences: z.string().optional(),
});

/* ------------------------------------------------------------------ */
/* SUPPLIERS                                                          */
/* ------------------------------------------------------------------ */

export const supplierConnectSchema = z.object({
  supplierId: z.string().uuid("Invalid supplier"),
});

export const supplierSearchSchema = z.object({
  keyword: z.string().min(1),
  country: z.string().optional(),
  minMargin: z.number().optional(),
  maxPrice: z.number().optional(),
  limit: z.number().default(20),
  offset: z.number().default(0),
});

/* ------------------------------------------------------------------ */
/* ORDERS                                                             */
/* ------------------------------------------------------------------ */

export const orderCreateSchema = z.object({
  customerId: z.string().uuid("Invalid customer"),
  currency: z.string().default("NGN"),
  customerNote: z.string().optional(),
  idempotencyKey: z.string().optional(),
});

export const orderFulfillSchema = z.object({
  orderId: z.string().uuid("Invalid order"),
  supplierId: z.string().uuid().optional(),
});

export const orderRetrySchema = z.object({
  supplierOrderId: z.string().uuid("Invalid supplier order"),
});

/* ------------------------------------------------------------------ */
/* PRICING                                                            */
/* ------------------------------------------------------------------ */

export const pricingRuleSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  appliesTo: z.enum(["ALL", "CATEGORY", "PRODUCT"]).default("ALL"),
  categoryId: z.string().uuid().optional(),
  productId: z.string().uuid().optional(),
  markupType: z.enum(["FIXED", "PERCENTAGE"]).default("PERCENTAGE"),
  markupValue: z.number().nonnegative(),
  minProfit: z.number().optional(),
  minMargin: z.number().optional(),
  psychological: z.boolean().default(true),
  priority: z.number().default(0),
});

/* ------------------------------------------------------------------ */
/* AUTOMATION                                                         */
/* ------------------------------------------------------------------ */

export const automationRuleSchema = z.object({
  name: z.string().min(1),
  type: z.string().min(1),
  config: z.record(z.string(), z.any()).default({}),
});

/* ------------------------------------------------------------------ */
/* AI                                                                 */
/* ------------------------------------------------------------------ */

export const aiMessageSchema = z.object({
  conversationId: z.string().uuid().optional(),
  message: z.string().min(1),
  storeId: z.string().uuid().optional(),
});

/* ------------------------------------------------------------------ */
/* NOTIFICATION PREFERENCES                                           */
/* ------------------------------------------------------------------ */

export const notificationPreferencesSchema = z.object({
  email: z.boolean().default(true),
  whatsapp: z.boolean().default(false),
  inApp: z.boolean().default(true),
});
