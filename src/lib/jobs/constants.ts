/**
 * Persistent background job names.
 * Registered in src/worker.ts with handlers and retry policies.
 */

export const JOB = {
  PRODUCT_DISCOVER: "product.discover",
  PRODUCT_RESEARCH: "product.research",
  PRODUCT_SYNC_PRICES: "product.sync-prices",
  SUPPLIER_SYNC: "supplier.sync",
  SUPPLIER_SYNC_INVENTORY: "supplier.sync-inventory",
  SUPPLIER_SCORE: "supplier.score",
  ORDER_FULFILL: "order.fulfill",
  ORDER_SYNC_TRACKING: "order.sync-tracking",
  ORDER_RETRY: "order.retry",
  NOTIFICATION_SEND: "notification.send",
  ANALYTICS_AGGREGATE: "analytics.aggregate",
  ABANDONED_CART_PROCESS: "abandoned-cart.process",
} as const;

export type JobName = (typeof JOB)[keyof typeof JOB];

export const DEFAULT_OPTIONS = {
  retries: 3,
  backoff: "exponential",
  lifetime: 3600, // seconds
  ttl: 86400,
  priority: 0,
} as const;
