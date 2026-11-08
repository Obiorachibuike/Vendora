import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  real,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* ENUMS                                                              */
/* ------------------------------------------------------------------ */

export const userRole = pgEnum("user_role", [
  "SUPER_ADMIN",
  "STORE_OWNER",
  "TEAM_MEMBER",
  "CUSTOMER",
]);

export const memberRole = pgEnum("member_role", ["OWNER", "ADMIN", "MEMBER"]);

export const markupType = pgEnum("markup_type", ["FIXED", "PERCENTAGE"]);

export const supplierMarketplace = pgEnum("supplier_marketplace", [
  "CJDROPSHIPPING",
  "ALIEXPRESS",
  "ALIBABA",
  "ZENDROP",
  "SPOCKET",
  "OTHER",
]);

export const connectionStatus = pgEnum("connection_status", [
  "PENDING",
  "ACTIVE",
  "ERROR",
  "DISCONNECTED",
]);

export const healthStatus = pgEnum("health_status", [
  "HEALTHY",
  "DEGRADED",
  "UNKNOWN",
  "DOWN",
]);

export const productStatus = pgEnum("product_status", [
  "DRAFT",
  "ACTIVE",
  "ARCHIVED",
]);

export const researchStatus = pgEnum("research_status", [
  "PENDING",
  "COMPLETED",
  "FAILED",
]);

export const pricingRuleAppliesTo = pgEnum("pricing_rule_applies_to", [
  "ALL",
  "CATEGORY",
  "PRODUCT",
]);

export const addressType = pgEnum("address_type", ["SHIPPING", "BILLING"]);

export const orderStatus = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "PAID",
  "PROCESSING",
  "SUPPLIER_SELECTION",
  "AWAITING_SUPPLIER_CONFIRMATION",
  "SUPPLIER_CONFIRMED",
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "FAILED",
  "REFUND_PENDING",
  "REFUNDED",
  "REQUIRES_ATTENTION",
]);

export const paymentStatus = pgEnum("payment_status", [
  "UNPAID",
  "PAID",
  "PARTIALLY_PAID",
  "REFUNDED",
  "FAILED",
]);

export const fulfillmentStatus = pgEnum("fulfillment_status", [
  "NOT_FULFILLED",
  "PENDING",
  "PARTIAL_FULFILLED",
  "FULFILLED",
]);

export const supplierOrderStatus = pgEnum("supplier_order_status", [
  "PENDING",
  "SUBMITTED",
  "CONFIRMED",
  "REJECTED",
  "CANCELLED",
  "SHIPPED",
  "DELIVERED",
  "FAILED",
]);

export const paymentProvider = pgEnum("payment_provider", [
  "PAYSTACK",
  "FLUTTERWAVE",
  "STRIPE",
  "MANUAL",
]);

export const paymentTransactionStatus = pgEnum("payment_transaction_status", [
  "PENDING",
  "SUCCESS",
  "FAILED",
  "REFUNDED",
]);

export const refundStatus = pgEnum("refund_status", [
  "PENDING",
  "APPROVED",
  "PROCESSED",
  "REJECTED",
]);

export const subscriptionStatus = pgEnum("subscription_status", [
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
  "TRIALING",
  "PAUSED",
]);

export const jobStatus = pgEnum("job_status", ["PENDING", "COMPLETED", "FAILED"]);

export const exceptionStatus = pgEnum("exception_status", [
  "OPEN",
  "RESOLVED",
  "DISMISSED",
]);

/* ------------------------------------------------------------------ */
/* HELPERS                                                            */
/* ------------------------------------------------------------------ */

const createdAt = timestamp("created_at").defaultNow().notNull();
const updatedAt = timestamp("updated_at").$onUpdate(() => new Date());

/* ------------------------------------------------------------------ */
/* AUTH & IDENTITY                                                    */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").unique().notNull(),
    emailVerified: timestamp("email_verified"),
    passwordHash: text("password_hash"),
    name: text("name"),
    image: text("image"),
    role: userRole("role").default("STORE_OWNER").notNull(),
    phone: text("phone"),
    country: text("country"),
    timezone: text("timezone").default("Africa/Lagos").notNull(),
    locale: text("locale").default("en").notNull(),
    onboardingComplete: boolean("onboarding_complete").default(false).notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    emailIdx: index("users_email_idx").on(t.email),
    roleIdx: index("users_role_idx").on(t.role),
  }),
);

export const accounts = pgTable(
  "accounts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    type: text("type").notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refreshToken: text("refresh_token"),
    accessToken: text("access_token"),
    expiresAt: integer("expires_at"),
    tokenType: text("token_type"),
    scope: text("scope"),
    idToken: text("id_token"),
    sessionState: text("session_state"),
  },
  (t) => ({
    userIdIdx: index("accounts_user_id_idx").on(t.userId),
    providerUnique: uniqueIndex("accounts_provider_account_unique").on(
      t.provider,
      t.providerAccountId,
    ),
  }),
);

export const sessions = pgTable(
  "sessions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sessionToken: text("session_token").unique().notNull(),
    userId: uuid("user_id").notNull(),
    expires: timestamp("expires").notNull(),
  },
  (t) => ({
    userIdIdx: index("sessions_user_id_idx").on(t.userId),
  }),
);

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").unique().notNull(),
    expires: timestamp("expires").notNull(),
  },
  (t) => ({
    identifierTokenUnique: uniqueIndex(
      "verification_tokens_identifier_token_unique",
    ).on(t.identifier, t.token),
  }),
);

export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    token: text("token").unique().notNull(),
    expires: timestamp("expires").notNull(),
  },
  (t) => ({
    userIdIdx: index("password_reset_tokens_user_id_idx").on(t.userId),
  }),
);

/* ------------------------------------------------------------------ */
/* MULTI-TENANCY                                                      */
/* ------------------------------------------------------------------ */

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    country: text("country"),
    currency: text("currency").default("NGN").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    slugIdx: uniqueIndex("organizations_slug_unique").on(t.slug),
  }),
);

export const organizationMembers = pgTable(
  "organization_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id").notNull(),
    userId: uuid("user_id").notNull(),
    role: memberRole("role").default("MEMBER").notNull(),
    createdAt,
  },
  (t) => ({
    orgUserUnique: uniqueIndex("organization_members_org_user_unique").on(
      t.organizationId,
      t.userId,
    ),
    organizationIdIdx: index("organization_members_organization_id_idx").on(
      t.organizationId,
    ),
    userIdIdx: index("organization_members_user_id_idx").on(t.userId),
  }),
);

export const stores = pgTable(
  "stores",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").unique().notNull(),
    description: text("description"),
    country: text("country").notNull(),
    currency: text("currency").default("NGN").notNull(),
    domain: text("domain"),
    logoUrl: text("logo_url"),
    theme: text("theme").default("default").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),
    timezone: text("timezone").default("Africa/Lagos").notNull(),
    sellerPlatform: text("seller_platform"),
    platformDomain: text("platform_domain"),
    platformToken: text("platform_token"), // encrypted

    ownerId: uuid("owner_id").notNull(),
    organizationId: uuid("organization_id").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    organizationIdIdx: index("stores_organization_id_idx").on(t.organizationId),
    slugIdx: uniqueIndex("stores_slug_unique").on(t.slug),
    ownerIdIdx: index("stores_owner_id_idx").on(t.ownerId),
    isPublishedIdx: index("stores_is_published_idx").on(t.isPublished),
  }),
);

export const storeSettings = pgTable(
  "store_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").unique().notNull(),
    allowAutoFulfillment: boolean("allow_auto_fulfillment").default(true).notNull(),
    minProfitMargin: real("min_profit_margin").default(0.2).notNull(),
    minProfitAmount: real("min_profit_amount"),
    defaultMarkupType: markupType("default_markup_type").default("PERCENTAGE").notNull(),
    defaultMarkupValue: real("default_markup_value").default(50).notNull(),
    psychologicalPricing: boolean("psychological_pricing").default(true).notNull(),
    autoPublishProducts: boolean("auto_publish_products").default(false).notNull(),
    lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
    notificationPreferences: jsonb("notification_preferences").default({}).notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: uniqueIndex("store_settings_store_id_unique").on(t.storeId),
  }),
);

/* ------------------------------------------------------------------ */
/* SUPPLIERS & INTEGRATIONS                                           */
/* ------------------------------------------------------------------ */

export const suppliers = pgTable(
  "suppliers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    marketplace: supplierMarketplace("marketplace").notNull(),
    baseUrl: text("base_url"),
    isActive: boolean("is_active").default(true).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    supportsApi: boolean("supports_api").default(false).notNull(),
    apiDocumentationUrl: text("api_documentation_url"),
    notes: text("notes"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    marketplaceIdx: index("suppliers_marketplace_idx").on(t.marketplace),
    isEnabledIdx: index("suppliers_is_enabled_idx").on(t.isEnabled),
  }),
);

export const supplierConnections = pgTable(
  "supplier_connections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    supplierId: uuid("supplier_id").notNull(),
    externalAccountId: text("external_account_id"),
    status: connectionStatus("status").default("PENDING").notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
    healthStatus: healthStatus("health_status").default("UNKNOWN").notNull(),
    lastHealthCheck: timestamp("last_health_check"),
    rateLimitInfo: jsonb("rate_limit_info"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeSupplierUnique: uniqueIndex(
      "supplier_connections_store_supplier_unique",
    ).on(t.storeId, t.supplierId),
    storeIdIdx: index("supplier_connections_store_id_idx").on(t.storeId),
    supplierIdIdx: index("supplier_connections_supplier_id_idx").on(t.supplierId),
    statusIdx: index("supplier_connections_status_idx").on(t.status),
    healthStatusIdx: index("supplier_connections_health_idx").on(t.healthStatus),
  }),
);

export const supplierCredentials = pgTable(
  "supplier_credentials",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectionId: uuid("connection_id").unique().notNull(),
    encryptedToken: text("encrypted_token").notNull(),
    encryptedSecret: text("encrypted_secret"),
    encryptedRefresh: text("encrypted_refresh"),
    tokenExpiresAt: timestamp("token_expires_at"),
    scopes: text("scopes"),
    updatedAt,
  },
  (t) => ({
    connectionIdIdx: uniqueIndex(
      "supplier_credentials_connection_id_unique",
    ).on(t.connectionId),
  }),
);

export const supplierProducts = pgTable(
  "supplier_products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    connectionId: uuid("connection_id").notNull(),
    supplierId: uuid("supplier_id").notNull(),
    externalProductId: text("external_product_id").notNull(),
    externalUrl: text("external_url"),
    name: text("name").notNull(),
    description: text("description"),
    category: text("category"),
    brand: text("brand"),
    sku: text("sku"),
    images: text("images").array().default([]).notNull(),
    minOrderQty: integer("min_order_qty").default(1).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    connectionIdIdx: index("supplier_products_connection_id_idx").on(t.connectionId),
    supplierIdIdx: index("supplier_products_supplier_id_idx").on(t.supplierId),
    externalProductIdIdx: index(
      "supplier_products_external_product_id_idx",
    ).on(t.externalProductId),
    nameIdx: index("supplier_products_name_idx").on(t.name),
  }),
);

export const supplierVariants = pgTable(
  "supplier_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull(),
    externalVariantId: text("external_variant_id").notNull(),
    sku: text("sku"),
    name: text("name"),
    options: jsonb("options"),
    weight: real("weight"),
    dimensions: jsonb("dimensions"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    productIdIdx: index("supplier_variants_product_id_idx").on(t.productId),
    externalVariantIdIdx: index(
      "supplier_variants_external_variant_id_idx",
    ).on(t.externalVariantId),
  }),
);

export const supplierInventory = pgTable(
  "supplier_inventory",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    variantId: uuid("variant_id").notNull(),
    quantity: integer("quantity").notNull(),
    available: boolean("available").default(true).notNull(),
    warehouses: jsonb("warehouses"),
    lastCheckedAt: timestamp("last_checked_at"),
  },
  (t) => ({
    variantIdIdx: index("supplier_inventory_variant_id_idx").on(t.variantId),
  }),
);

export const supplierOffers = pgTable(
  "supplier_offers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),
    supplierId: uuid("supplier_id").notNull(),
    connectionId: uuid("connection_id").notNull(),
    wholesalePrice: real("wholesale_price").notNull(),
    currency: text("currency").default("NGN").notNull(),
    shippingPrice: real("shipping_price").notNull(),
    shippingDestinations: text("shipping_destinations").array(),
    estimatedDeliveryMinDays: integer("estimated_delivery_min_days").notNull(),
    estimatedDeliveryMaxDays: integer("estimated_delivery_max_days").notNull(),
    stockAvailable: boolean("stock_available").default(true).notNull(),
    stockQuantity: integer("stock_quantity"),
    returnPolicy: text("return_policy"),
    trackingSupported: boolean("tracking_supported").default(false).notNull(),
    reliabilityScore: real("reliability_score").default(0).notNull(),
    lastVerifiedAt: timestamp("last_verified_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    productIdIdx: index("supplier_offers_product_id_idx").on(t.productId),
    supplierIdIdx: index("supplier_offers_supplier_id_idx").on(t.supplierId),
    connectionIdIdx: index("supplier_offers_connection_id_idx").on(t.connectionId),
    wholesalePriceIdx: index(
      "supplier_offers_wholesale_price_idx",
    ).on(t.wholesalePrice),
    stockAvailableIdx: index("supplier_offers_stock_available_idx").on(
      t.stockAvailable,
    ),
  }),
);

export const supplierPerformance = pgTable(
  "supplier_performance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierId: uuid("supplier_id").notNull(),
    period: text("period").notNull(),
    ordersCount: integer("orders_count").default(0).notNull(),
    successCount: integer("success_count").default(0).notNull(),
    failureCount: integer("failure_count").default(0).notNull(),
    avgDeliveryDays: real("avg_delivery_days"),
    cancellationRate: real("cancellation_rate"),
    returnRate: real("return_rate"),
    trackingRate: real("tracking_rate"),
    score: real("score").default(0).notNull(),
    updatedAt,
  },
  (t) => ({
    supplierPeriodUnique: uniqueIndex(
      "supplier_performance_supplier_period_unique",
    ).on(t.supplierId, t.period),
    supplierIdIdx: index("supplier_performance_supplier_id_idx").on(t.supplierId),
  }),
);

/* ------------------------------------------------------------------ */
/* CATALOG (INTERNAL PRODUCTS)                                        */
/* ------------------------------------------------------------------ */

export const productCategories = pgTable(
  "product_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    parentId: uuid("parent_id"),
    description: text("description"),
    image: text("image"),
    createdAt,
  },
  (t) => ({
    storeSlugUnique: uniqueIndex("product_categories_store_slug_unique").on(
      t.storeId,
      t.slug,
    ),
    storeIdIdx: index("product_categories_store_id_idx").on(t.storeId),
    parentIdIdx: index("product_categories_parent_id_idx").on(t.parentId),
  }),
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    categoryId: uuid("category_id"),
    title: text("title").notNull(),
    handle: text("handle").unique().notNull(),
    description: text("description"),
    shortDescription: text("short_description"),
    sku: text("sku"),
    brand: text("brand"),
    status: productStatus("status").default("DRAFT").notNull(),
    publishedAt: timestamp("published_at"),
    basePrice: real("base_price").notNull(),
    currency: text("currency").default("NGN").notNull(),
    costBasis: real("cost_basis"),
    minMargin: real("min_margin"),
    weight: real("weight"),
    images: text("images").array().default([]).notNull(),
    tags: text("tags").array().default([]).notNull(),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("products_store_id_idx").on(t.storeId),
    statusIdx: index("products_status_idx").on(t.status),
    handleIdx: uniqueIndex("products_handle_unique").on(t.handle),
    categoryIdIdx: index("products_category_id_idx").on(t.categoryId),
  }),
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull(),
    name: text("name"),
    sku: text("sku"),
    options: jsonb("options"),
    priceAdjustment: real("price_adjustment").default(0).notNull(),
    weight: real("weight"),
    inventoryQuantity: integer("inventory_quantity").default(0).notNull(),
    trackInventory: boolean("track_inventory").default(true).notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    productIdIdx: index("product_variants_product_id_idx").on(t.productId),
    skuIdx: index("product_variants_sku_idx").on(t.sku),
  }),
);

export const productSupplierMappings = pgTable(
  "product_supplier_mappings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),
    supplierOfferId: uuid("supplier_offer_id").notNull(),
    storeId: uuid("store_id").notNull(),
    isPrimary: boolean("is_primary").default(true).notNull(),
    autoSwitchEnabled: boolean("auto_switch_enabled").default(true).notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
  },
  (t) => ({
    productOfferUnique: uniqueIndex(
      "product_supplier_mappings_product_offer_unique",
    ).on(t.productId, t.supplierOfferId),
    storeIdIdx: index("product_supplier_mappings_store_id_idx").on(t.storeId),
    supplierOfferIdIdx: index(
      "product_supplier_mappings_offer_id_idx",
    ).on(t.supplierOfferId),
    isPrimaryIdx: index("product_supplier_mappings_is_primary_idx").on(
      t.isPrimary,
    ),
  }),
);

/* ------------------------------------------------------------------ */
/* PRODUCT RESEARCH                                                   */
/* ------------------------------------------------------------------ */

export const productResearch = pgTable(
  "product_research",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id"),
    userId: uuid("user_id").notNull(),
    keyword: text("keyword").notNull(),
    category: text("category"),
    country: text("country"),
    status: researchStatus("status").default("PENDING").notNull(),
    dataSources: text("data_sources").array(),
    evidence: jsonb("evidence"),
    researchedAt: timestamp("researched_at"),
    createdAt,
  },
  (t) => ({
    storeIdIdx: index("product_research_store_id_idx").on(t.storeId),
    userIdIdx: index("product_research_user_id_idx").on(t.userId),
    statusIdx: index("product_research_status_idx").on(t.status),
    keywordIdx: index("product_research_keyword_idx").on(t.keyword),
  }),
);

export const productOpportunities = pgTable(
  "product_opportunities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    researchId: uuid("research_id").notNull(),
    externalProductId: text("external_product_id"),
    title: text("title").notNull(),
    image: text("image"),
    category: text("category"),
    supplierCount: integer("supplier_count").default(0).notNull(),
    lowestSupplierPrice: real("lowest_supplier_price"),
    estimatedLandedCost: real("estimated_landed_cost"),
    suggestedSellingPrice: real("suggested_selling_price"),
    estimatedProfit: real("estimated_profit"),
    demandScore: integer("demand_score"),
    competitionScore: integer("competition_score"),
    opportunityScore: integer("opportunity_score"),
    evidence: jsonb("evidence"),
    researchedAt: timestamp("researched_at"),
  },
  (t) => ({
    researchIdIdx: index("product_opportunities_research_id_idx").on(
      t.researchId,
    ),
    opportunityScoreIdx: index(
      "product_opportunities_opportunity_score_idx",
    ).on(t.opportunityScore),
  }),
);

/* ------------------------------------------------------------------ */
/* PRICING                                                            */
/* ------------------------------------------------------------------ */

export const pricingRules = pgTable(
  "pricing_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    appliesTo: pricingRuleAppliesTo("applies_to").default("ALL").notNull(),
    categoryId: uuid("category_id"),
    productId: uuid("product_id"),
    markupType: markupType("markup_type").default("PERCENTAGE").notNull(),
    markupValue: real("markup_value").notNull(),
    minProfit: real("min_profit"),
    minMargin: real("min_margin"),
    psychological: boolean("psychological").default(true).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    priority: integer("priority").default(0).notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("pricing_rules_store_id_idx").on(t.storeId),
    isActiveIdx: index("pricing_rules_is_active_idx").on(t.isActive),
  }),
);

/* ------------------------------------------------------------------ */
/* CUSTOMERS, CARTS & ORDERS                                          */
/* ------------------------------------------------------------------ */

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    email: text("email"),
    phone: text("phone"),
    name: text("name"),
    externalId: text("external_id"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("customers_store_id_idx").on(t.storeId),
    emailIdx: index("customers_email_idx").on(t.email),
  }),
);

export const customerAddresses = pgTable(
  "customer_addresses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    customerId: uuid("customer_id").notNull(),
    type: addressType("type").default("SHIPPING").notNull(),
    name: text("name"),
    street: text("street").notNull(),
    city: text("city").notNull(),
    state: text("state"),
    postalCode: text("postal_code"),
    country: text("country").notNull(),
    phone: text("phone"),
    isDefault: boolean("is_default").default(false).notNull(),
  },
  (t) => ({
    customerIdIdx: index("customer_addresses_customer_id_idx").on(t.customerId),
  }),
);

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    userId: uuid("user_id"),
    customerId: uuid("customer_id"),
    sessionId: text("session_id"),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("carts_store_id_idx").on(t.storeId),
    sessionIdIdx: index("carts_session_id_idx").on(t.sessionId),
    customerIdIdx: index("carts_customer_id_idx").on(t.customerId),
  }),
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    cartId: uuid("cart_id").notNull(),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),
    quantity: integer("quantity").notNull(),
  },
  (t) => ({
    cartIdIdx: index("cart_items_cart_id_idx").on(t.cartId),
  }),
);

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    customerId: uuid("customer_id").notNull(),
    orderNumber: text("order_number").unique().notNull(),
    status: orderStatus("status").default("PENDING_PAYMENT").notNull(),
    paymentStatus: paymentStatus("payment_status").default("UNPAID").notNull(),
    fulfillmentStatus: fulfillmentStatus("fulfillment_status").default("NOT_FULFILLED").notNull(),
    currency: text("currency").default("NGN").notNull(),
    subtotal: real("subtotal").notNull(),
    shippingTotal: real("shipping_total").notNull(),
    taxTotal: real("tax_total").notNull(),
    discountTotal: real("discount_total").notNull(),
    total: real("total").notNull(),
    paidAmount: real("paid_amount").default(0).notNull(),
    notes: text("notes"),
    customerNote: text("customer_note"),
    idempotencyKey: text("idempotency_key"),
    placedAt: timestamp("placed_at"),
    paidAt: timestamp("paid_at"),
    fulfilledAt: timestamp("fulfilled_at"),
    deliveredAt: timestamp("delivered_at"),
    cancelledAt: timestamp("cancelled_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("orders_store_id_idx").on(t.storeId),
    statusIdx: index("orders_status_idx").on(t.status),
    paymentStatusIdx: index("orders_payment_status_idx").on(t.paymentStatus),
    orderNumberIdx: uniqueIndex("orders_order_number_unique").on(t.orderNumber),
    idempotencyKeyIdx: index("orders_idempotency_key_idx").on(t.idempotencyKey),
    createdAtIdx: index("orders_created_at_idx").on(t.createdAt),
  }),
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id").notNull(),
    variantId: uuid("variant_id"),
    supplierOfferId: uuid("supplier_offer_id"),
    supplierOrderItemId: text("supplier_order_item_id"),
    title: text("title").notNull(),
    sku: text("sku"),
    quantity: integer("quantity").notNull(),
    unitPrice: real("unit_price").notNull(),
    total: real("total").notNull(),
    cost: real("cost"),
  },
  (t) => ({
    orderIdIdx: index("order_items_order_id_idx").on(t.orderId),
    supplierOfferIdIdx: index("order_items_supplier_offer_id_idx").on(
      t.supplierOfferId,
    ),
  }),
);

export const supplierOrders = pgTable(
  "supplier_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    supplierId: uuid("supplier_id").notNull(),
    connectionId: uuid("connection_id").notNull(),
    externalOrderId: text("external_order_id"),
    status: supplierOrderStatus("status").default("PENDING").notNull(),
    total: real("total").notNull(),
    currency: text("currency").default("NGN").notNull(),
    shippingTotal: real("shipping_total"),
    customerAddress: jsonb("customer_address"),
    items: jsonb("items"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    shippedAt: timestamp("shipped_at"),
    deliveredAt: timestamp("delivered_at"),
    error: text("error"),
    retryCount: integer("retry_count").default(0).notNull(),
    idempotencyKey: text("idempotency_key").unique().notNull(),
    createdAt,
    updatedAt,
  },
  (t) => ({
    orderIdIdx: index("supplier_orders_order_id_idx").on(t.orderId),
    supplierIdIdx: index("supplier_orders_supplier_id_idx").on(t.supplierId),
    externalOrderIdIdx: index(
      "supplier_orders_external_order_id_idx",
    ).on(t.externalOrderId),
    statusIdx: index("supplier_orders_status_idx").on(t.status),
    idempotencyKeyIdx: uniqueIndex(
      "supplier_orders_idempotency_key_unique",
    ).on(t.idempotencyKey),
  }),
);

export const supplierOrderEvents = pgTable(
  "supplier_order_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    supplierOrderId: uuid("supplier_order_id").notNull(),
    type: text("type").notNull(),
    payload: jsonb("payload"),
    createdAt,
  },
  (t) => ({
    supplierOrderIdIdx: index(
      "supplier_order_events_supplier_order_id_idx",
    ).on(t.supplierOrderId),
  }),
);

export const fulfillments = pgTable(
  "fulfillments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").unique().notNull(),
    status: text("status").default("pending").notNull(),
    supplierOrderId: uuid("supplier_order_id"),
    trackingNumber: text("tracking_number"),
    trackingUrl: text("tracking_url"),
    estimatedDelivery: timestamp("estimated_delivery"),
    deliveredAt: timestamp("delivered_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    orderIdIdx: uniqueIndex("fulfillments_order_id_unique").on(t.orderId),
    trackingNumberIdx: index("fulfillments_tracking_number_idx").on(
      t.trackingNumber,
    ),
  }),
);

export const trackingEvents = pgTable(
  "tracking_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    fulfillmentId: uuid("fulfillment_id").notNull(),
    status: text("status").notNull(),
    location: text("location"),
    occurredAt: timestamp("occurred_at").notNull(),
    description: text("description"),
  },
  (t) => ({
    fulfillmentIdIdx: index("tracking_events_fulfillment_id_idx").on(
      t.fulfillmentId,
    ),
    occurredAtIdx: index("tracking_events_occurred_at_idx").on(t.occurredAt),
  }),
);

/* ------------------------------------------------------------------ */
/* PAYMENTS & REFUNDS                                                 */
/* ------------------------------------------------------------------ */

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    provider: paymentProvider("provider").notNull(),
    externalTransactionId: text("external_transaction_id"),
    amount: real("amount").notNull(),
    currency: text("currency").default("NGN").notNull(),
    status: paymentTransactionStatus("status").default("PENDING").notNull(),
    fee: real("fee"),
    gatewayResponse: jsonb("gateway_response"),
    verifiedAt: timestamp("verified_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    orderIdIdx: index("payments_order_id_idx").on(t.orderId),
    externalTransactionIdIdx: index(
      "payments_external_transaction_id_idx",
    ).on(t.externalTransactionId),
    statusIdx: index("payments_status_idx").on(t.status),
  }),
);

export const refunds = pgTable(
  "refunds",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    paymentId: uuid("payment_id"),
    amount: real("amount").notNull(),
    currency: text("currency").default("NGN").notNull(),
    reason: text("reason"),
    status: refundStatus("status").default("PENDING").notNull(),
    externalRefundId: text("external_refund_id"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    orderIdIdx: index("refunds_order_id_idx").on(t.orderId),
    statusIdx: index("refunds_status_idx").on(t.status),
  }),
);

/* ------------------------------------------------------------------ */
/* SUBSCRIPTIONS & BILLING                                            */
/* ------------------------------------------------------------------ */

export const subscriptions = pgTable(
  "subscriptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    plan: text("plan").notNull(),
    status: subscriptionStatus("status").default("ACTIVE").notNull(),
    price: real("price").notNull(),
    currency: text("currency").default("NGN").notNull(),
    interval: text("interval").notNull(),
    currentPeriodStart: timestamp("current_period_start").notNull(),
    currentPeriodEnd: timestamp("current_period_end").notNull(),
    cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false).notNull(),
    canceledAt: timestamp("canceled_at"),
    provider: text("provider"),
    providerSubscriptionId: text("provider_subscription_id"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("subscriptions_store_id_idx").on(t.storeId),
    statusIdx: index("subscriptions_status_idx").on(t.status),
    planIdx: index("subscriptions_plan_idx").on(t.plan),
  }),
);

/* ------------------------------------------------------------------ */
/* NOTIFICATIONS                                                      */
/* ------------------------------------------------------------------ */

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    storeId: uuid("store_id"),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message"),
    read: boolean("read").default(false).notNull(),
    data: jsonb("data"),
    createdAt,
  },
  (t) => ({
    userIdIdx: index("notifications_user_id_idx").on(t.userId),
    storeIdIdx: index("notifications_store_id_idx").on(t.storeId),
    readIdx: index("notifications_read_idx").on(t.read),
    createdAtIdx: index("notifications_created_at_idx").on(t.createdAt),
  }),
);

/* ------------------------------------------------------------------ */
/* BACKGROUND JOBS (audit mirror of pg-boss)                          */
/* ------------------------------------------------------------------ */

export const backgroundJobRecords = pgTable(
  "background_job_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    status: jobStatus("status").default("PENDING").notNull(),
    payload: jsonb("payload"),
    error: text("error"),
    retries: integer("retries").default(0).notNull(),
    maxRetries: integer("max_retries").default(3).notNull(),
    runAt: timestamp("run_at"),
    completedAt: timestamp("completed_at"),
    createdAt,
  },
  (t) => ({
    nameIdx: index("background_job_records_name_idx").on(t.name),
    statusIdx: index("background_job_records_status_idx").on(t.status),
  }),
);

/* ------------------------------------------------------------------ */
/* AUTOMATION & EXCEPTIONS                                            */
/* ------------------------------------------------------------------ */

export const automationRules = pgTable(
  "automation_rules",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    type: text("type").notNull(),
    config: jsonb("config"),
    isActive: boolean("is_active").default(true).notNull(),
    lastRunAt: timestamp("last_run_at"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    storeIdIdx: index("automation_rules_store_id_idx").on(t.storeId),
    isActiveIdx: index("automation_rules_is_active_idx").on(t.isActive),
  }),
);

export const orderExceptions = pgTable(
  "order_exceptions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    orderId: uuid("order_id").notNull(),
    reason: text("reason").notNull(),
    status: exceptionStatus("status").default("OPEN").notNull(),
    resolution: text("resolution"),
    resolvedBy: uuid("resolved_by"),
    resolvedAt: timestamp("resolved_at"),
    createdAt,
  },
  (t) => ({
    orderIdIdx: index("order_exceptions_order_id_idx").on(t.orderId),
    statusIdx: index("order_exceptions_status_idx").on(t.status),
  }),
);

/* ------------------------------------------------------------------ */
/* AI                                                                 */
/* ------------------------------------------------------------------ */

export const aiConversations = pgTable(
  "ai_conversations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").notNull(),
    storeId: uuid("store_id"),
    title: text("title"),
    createdAt,
    updatedAt,
  },
  (t) => ({
    userIdIdx: index("ai_conversations_user_id_idx").on(t.userId),
    storeIdIdx: index("ai_conversations_store_id_idx").on(t.storeId),
  }),
);

export const aiMessages = pgTable(
  "ai_messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id").notNull(),
    role: text("role").notNull(),
    content: text("content").notNull(),
    toolCalls: jsonb("tool_calls"),
    createdAt,
  },
  (t) => ({
    conversationIdIdx: index("ai_messages_conversation_id_idx").on(
      t.conversationId,
    ),
  }),
);

export const aiActionLogs = pgTable(
  "ai_action_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"),
    storeId: uuid("store_id"),
    action: text("action").notNull(),
    details: jsonb("details"),
    approvedBy: uuid("approved_by"),
    approvedAt: timestamp("approved_at"),
    createdAt,
  },
  (t) => ({
    storeIdIdx: index("ai_action_logs_store_id_idx").on(t.storeId),
    userIdIdx: index("ai_action_logs_user_id_idx").on(t.userId),
    actionIdx: index("ai_action_logs_action_idx").on(t.action),
    createdAtIdx: index("ai_action_logs_created_at_idx").on(t.createdAt),
  }),
);

/* ------------------------------------------------------------------ */
/* AUDIT LOG                                                          */
/* ------------------------------------------------------------------ */

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id"),
    storeId: uuid("store_id"),
    action: text("action").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    oldValues: jsonb("old_values"),
    newValues: jsonb("new_values"),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    createdAt,
  },
  (t) => ({
    storeIdIdx: index("audit_logs_store_id_idx").on(t.storeId),
    userIdIdx: index("audit_logs_user_id_idx").on(t.userId),
    actionIdx: index("audit_logs_action_idx").on(t.action),
    createdAtIdx: index("audit_logs_created_at_idx").on(t.createdAt),
  }),
);

/* ------------------------------------------------------------------ */
/* STOREFRONT                                                         */
/* ------------------------------------------------------------------ */

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    image: text("image"),
    createdAt,
  },
  (t) => ({
    storeSlugUnique: uniqueIndex("collections_store_slug_unique").on(
      t.storeId,
      t.slug,
    ),
    storeIdIdx: index("collections_store_id_idx").on(t.storeId),
  }),
);

/* ------------------------------------------------------------------ */
/* ANALYTICS                                                          */
/* ------------------------------------------------------------------ */

export const analyticsEvents = pgTable(
  "analytics_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    name: text("name").notNull(),
    properties: jsonb("properties"),
    occurredAt: timestamp("occurred_at").defaultNow().notNull(),
  },
  (t) => ({
    storeIdIdx: index("analytics_events_store_id_idx").on(t.storeId),
    nameIdx: index("analytics_events_name_idx").on(t.name),
    occurredAtIdx: index("analytics_events_occurred_at_idx").on(t.occurredAt),
  }),
);

/* ------------------------------------------------------------------ */
/* AI USAGE                                                           */
/* ------------------------------------------------------------------ */

export const aiUsage = pgTable(
  "ai_usage",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    storeId: uuid("store_id").notNull(),
    userId: uuid("user_id").notNull(),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    tokens: integer("tokens").default(0).notNull(),
    cost: real("cost").default(0).notNull(),
    createdAt,
  },
  (t) => ({
    storeIdIdx: index("ai_usage_store_id_idx").on(t.storeId),
    userIdIdx: index("ai_usage_user_id_idx").on(t.userId),
  }),
);
