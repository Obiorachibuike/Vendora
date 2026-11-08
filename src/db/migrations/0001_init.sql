-- Vendora AI — Initial migration
-- Run against a PostgreSQL database:
--   psql $DATABASE_URL -f src/db/migrations/0001_init.sql
-- Or via drizzle-kit: npx drizzle-kit migrate

-- Extensions needed by the schema (uuid gen, crypto)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===========================================================================
-- AUTH & IDENTITY
-- ===========================================================================

CREATE TYPE user_role AS ENUM ('SUPER_ADMIN','STORE_OWNER','TEAM_MEMBER','CUSTOMER');

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  email_verified timestamptz,
  password_hash text,
  name text,
  image text,
  role user_role NOT NULL DEFAULT 'STORE_OWNER',
  phone text,
  country text,
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  locale text NOT NULL DEFAULT 'en',
  onboarding_complete boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX users_email_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);

CREATE TABLE accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type text NOT NULL,
  provider text NOT NULL,
  provider_account_id text NOT NULL,
  refresh_token text,
  access_token text,
  expires_at integer,
  token_type text,
  scope text,
  id_token text,
  session_state text
);

CREATE INDEX accounts_user_id_idx ON accounts(user_id);
CREATE UNIQUE INDEX accounts_provider_account_unique ON accounts(provider, provider_account_id);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_token text UNIQUE NOT NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires timestamptz NOT NULL
);

CREATE INDEX sessions_user_id_idx ON sessions(user_id);

CREATE TABLE verification_tokens (
  identifier text NOT NULL,
  token text UNIQUE NOT NULL,
  expires timestamptz NOT NULL
);

CREATE UNIQUE INDEX verification_tokens_identifier_token_unique ON verification_tokens(identifier, token);

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  expires timestamptz NOT NULL
);

CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens(user_id);

-- ===========================================================================
-- MULTI-TENANCY
-- ===========================================================================

CREATE TYPE member_role AS ENUM ('OWNER','ADMIN','MEMBER');

CREATE TABLE organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  country text,
  currency text NOT NULL DEFAULT 'NGN',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX organizations_slug_unique ON organizations(slug);

CREATE TABLE organization_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role member_role NOT NULL DEFAULT 'MEMBER',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX organization_members_org_user_unique ON organization_members(organization_id, user_id);
CREATE INDEX organization_members_organization_id_idx ON organization_members(organization_id);
CREATE INDEX organization_members_user_id_idx ON organization_members(user_id);

CREATE TABLE stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  country text NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  domain text,
  logo_url text,
  theme text NOT NULL DEFAULT 'default',
  is_published boolean NOT NULL DEFAULT false,
  timezone text NOT NULL DEFAULT 'Africa/Lagos',
  seller_platform text,
  platform_domain text,
  platform_token text,
  owner_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX stores_organization_id_idx ON stores(organization_id);
CREATE UNIQUE INDEX stores_slug_unique ON stores(slug);
CREATE INDEX stores_owner_id_idx ON stores(owner_id);
CREATE INDEX stores_is_published_idx ON stores(is_published);

CREATE TABLE store_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid UNIQUE NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  allow_auto_fulfillment boolean NOT NULL DEFAULT true,
  min_profit_margin real NOT NULL DEFAULT 0.2,
  min_profit_amount real,
  default_markup_type text NOT NULL DEFAULT 'PERCENTAGE',
  default_markup_value real NOT NULL DEFAULT 50,
  psychological_pricing boolean NOT NULL DEFAULT true,
  auto_publish_products boolean NOT NULL DEFAULT false,
  low_stock_threshold integer NOT NULL DEFAULT 5,
  notification_preferences jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX store_settings_store_id_unique ON store_settings(store_id);

-- ===========================================================================
-- SUPPLIERS & INTEGRATIONS
-- ===========================================================================

CREATE TYPE supplier_marketplace AS ENUM ('CJDROPSHIPPING','ALIEXPRESS','ALIBABA','ZENDROP','SPOCKET','OTHER');
CREATE TYPE connection_status AS ENUM ('PENDING','ACTIVE','ERROR','DISCONNECTED');
CREATE TYPE health_status AS ENUM ('HEALTHY','DEGRADED','UNKNOWN','DOWN');

CREATE TABLE suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  marketplace supplier_marketplace NOT NULL,
  base_url text,
  is_active boolean NOT NULL DEFAULT true,
  is_enabled boolean NOT NULL DEFAULT true,
  supports_api boolean NOT NULL DEFAULT false,
  api_documentation_url text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX suppliers_marketplace_idx ON suppliers(marketplace);
CREATE INDEX suppliers_is_enabled_idx ON suppliers(is_enabled);

CREATE TABLE supplier_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  external_account_id text,
  status connection_status NOT NULL DEFAULT 'PENDING',
  last_synced_at timestamptz,
  health_status health_status NOT NULL DEFAULT 'UNKNOWN',
  last_health_check timestamptz,
  rate_limit_info jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX supplier_connections_store_supplier_unique ON supplier_connections(store_id, supplier_id);
CREATE INDEX supplier_connections_store_id_idx ON supplier_connections(store_id);
CREATE INDEX supplier_connections_supplier_id_idx ON supplier_connections(supplier_id);
CREATE INDEX supplier_connections_status_idx ON supplier_connections(status);
CREATE INDEX supplier_connections_health_idx ON supplier_connections(health_status);

CREATE TABLE supplier_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid UNIQUE NOT NULL REFERENCES supplier_connections(id) ON DELETE CASCADE,
  encrypted_token text NOT NULL,
  encrypted_secret text,
  encrypted_refresh text,
  token_expires_at timestamptz,
  scopes text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX supplier_credentials_connection_id_unique ON supplier_credentials(connection_id);

CREATE TABLE supplier_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  connection_id uuid NOT NULL REFERENCES supplier_connections(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  external_product_id text NOT NULL,
  external_url text,
  name text NOT NULL,
  description text,
  category text,
  brand text,
  sku text,
  images text[] NOT NULL DEFAULT '{}',
  min_order_qty integer NOT NULL DEFAULT 1,
  is_active boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplier_products_connection_id_idx ON supplier_products(connection_id);
CREATE INDEX supplier_products_supplier_id_idx ON supplier_products(supplier_id);
CREATE INDEX supplier_products_external_product_id_idx ON supplier_products(external_product_id);
CREATE INDEX supplier_products_name_idx ON supplier_products(name);

CREATE TABLE supplier_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  external_variant_id text NOT NULL,
  sku text,
  name text,
  options jsonb,
  weight real,
  dimensions jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplier_variants_product_id_idx ON supplier_variants(product_id);
CREATE INDEX supplier_variants_external_variant_id_idx ON supplier_variants(external_variant_id);

CREATE TABLE supplier_inventory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES supplier_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  available boolean NOT NULL DEFAULT true,
  warehouses jsonb,
  last_checked_at timestamptz
);

CREATE INDEX supplier_inventory_variant_id_idx ON supplier_inventory(variant_id);

CREATE TABLE supplier_offers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES supplier_products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES supplier_variants(id) ON DELETE SET NULL,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES supplier_connections(id) ON DELETE CASCADE,
  wholesale_price real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  shipping_price real NOT NULL,
  shipping_destinations text[],
  estimated_delivery_min_days integer NOT NULL,
  estimated_delivery_max_days integer NOT NULL,
  stock_available boolean NOT NULL DEFAULT true,
  stock_quantity integer,
  return_policy text,
  tracking_supported boolean NOT NULL DEFAULT false,
  reliability_score real NOT NULL DEFAULT 0,
  last_verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplier_offers_product_id_idx ON supplier_offers(product_id);
CREATE INDEX supplier_offers_supplier_id_idx ON supplier_offers(supplier_id);
CREATE INDEX supplier_offers_connection_id_idx ON supplier_offers(connection_id);
CREATE INDEX supplier_offers_wholesale_price_idx ON supplier_offers(wholesale_price);
CREATE INDEX supplier_offers_stock_available_idx ON supplier_offers(stock_available);

CREATE TABLE supplier_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  period text NOT NULL,
  orders_count integer NOT NULL DEFAULT 0,
  success_count integer NOT NULL DEFAULT 0,
  failure_count integer NOT NULL DEFAULT 0,
  avg_delivery_days real,
  cancellation_rate real,
  return_rate real,
  tracking_rate real,
  score real NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX supplier_performance_supplier_period_unique ON supplier_performance(supplier_id, period);
CREATE INDEX supplier_performance_supplier_id_idx ON supplier_performance(supplier_id);

-- ===========================================================================
-- CATALOG (INTERNAL PRODUCTS)
-- ===========================================================================

CREATE TYPE product_status AS ENUM ('DRAFT','ACTIVE','ARCHIVED');

CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  parent_id uuid REFERENCES product_categories(id),
  description text,
  image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX product_categories_store_slug_unique ON product_categories(store_id, slug);
CREATE INDEX product_categories_store_id_idx ON product_categories(store_id);
CREATE INDEX product_categories_parent_id_idx ON product_categories(parent_id);

CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  category_id uuid REFERENCES product_categories(id),
  title text NOT NULL,
  handle text UNIQUE NOT NULL,
  description text,
  short_description text,
  sku text,
  brand text,
  status product_status NOT NULL DEFAULT 'DRAFT',
  published_at timestamptz,
  base_price real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  cost_basis real,
  min_margin real,
  weight real,
  images text[] NOT NULL DEFAULT '{}',
  tags text[] NOT NULL DEFAULT '{}',
  seo_title text,
  seo_description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_store_id_idx ON products(store_id);
CREATE INDEX products_status_idx ON products(status);
CREATE UNIQUE INDEX products_handle_unique ON products(handle);
CREATE INDEX products_category_id_idx ON products(category_id);

CREATE TABLE product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name text,
  sku text,
  options jsonb,
  price_adjustment real NOT NULL DEFAULT 0,
  weight real,
  inventory_quantity integer NOT NULL DEFAULT 0,
  track_inventory boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_variants_product_id_idx ON product_variants(product_id);
CREATE INDEX product_variants_sku_idx ON product_variants(sku);

CREATE TABLE product_supplier_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  supplier_offer_id uuid NOT NULL REFERENCES supplier_offers(id) ON DELETE CASCADE,
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  is_primary boolean NOT NULL DEFAULT true,
  auto_switch_enabled boolean NOT NULL DEFAULT true,
  last_synced_at timestamptz
);

CREATE UNIQUE INDEX product_supplier_mappings_product_offer_unique ON product_supplier_mappings(product_id, supplier_offer_id);
CREATE INDEX product_supplier_mappings_store_id_idx ON product_supplier_mappings(store_id);
CREATE INDEX product_supplier_mappings_offer_id_idx ON product_supplier_mappings(supplier_offer_id);
CREATE INDEX product_supplier_mappings_is_primary_idx ON product_supplier_mappings(is_primary);

-- ===========================================================================
-- PRODUCT RESEARCH
-- ===========================================================================

CREATE TYPE research_status AS ENUM ('PENDING','COMPLETED','FAILED');

CREATE TABLE product_research (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid REFERENCES stores(id) ON DELETE SET NULL,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  keyword text NOT NULL,
  category text,
  country text,
  status research_status NOT NULL DEFAULT 'PENDING',
  data_sources text[],
  evidence jsonb,
  researched_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX product_research_store_id_idx ON product_research(store_id);
CREATE INDEX product_research_user_id_idx ON product_research(user_id);
CREATE INDEX product_research_status_idx ON product_research(status);
CREATE INDEX product_research_keyword_idx ON product_research(keyword);

CREATE TABLE product_opportunities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  research_id uuid NOT NULL REFERENCES product_research(id) ON DELETE CASCADE,
  external_product_id text,
  title text NOT NULL,
  image text,
  category text,
  supplier_count integer NOT NULL DEFAULT 0,
  lowest_supplier_price real,
  estimated_landed_cost real,
  suggested_selling_price real,
  estimated_profit real,
  demand_score integer,
  competition_score integer,
  opportunity_score integer,
  evidence jsonb,
  researched_at timestamptz
);

CREATE INDEX product_opportunities_research_id_idx ON product_opportunities(research_id);
CREATE INDEX product_opportunities_opportunity_score_idx ON product_opportunities(opportunity_score);

-- ===========================================================================
-- PRICING
-- ===========================================================================

CREATE TYPE markup_type AS ENUM ('FIXED','PERCENTAGE');
CREATE TYPE pricing_rule_applies_to AS ENUM ('ALL','CATEGORY','PRODUCT');

CREATE TABLE pricing_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  applies_to pricing_rule_applies_to NOT NULL DEFAULT 'ALL',
  category_id uuid REFERENCES product_categories(id),
  product_id uuid REFERENCES products(id),
  markup_type markup_type NOT NULL DEFAULT 'PERCENTAGE',
  markup_value real NOT NULL,
  min_profit real,
  min_margin real,
  psychological boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  priority integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX pricing_rules_store_id_idx ON pricing_rules(store_id);
CREATE INDEX pricing_rules_is_active_idx ON pricing_rules(is_active);

-- ===========================================================================
-- CUSTOMERS, CARTS & ORDERS
-- ===========================================================================

CREATE TYPE address_type AS ENUM ('SHIPPING','BILLING');

CREATE TABLE customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  email text,
  phone text,
  name text,
  external_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX customers_store_id_idx ON customers(store_id);
CREATE INDEX customers_email_idx ON customers(email);

CREATE TABLE customer_addresses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  type address_type NOT NULL DEFAULT 'SHIPPING',
  name text,
  street text NOT NULL,
  city text NOT NULL,
  state text,
  postal_code text,
  country text NOT NULL,
  phone text,
  is_default boolean NOT NULL DEFAULT false
);

CREATE INDEX customer_addresses_customer_id_idx ON customer_addresses(customer_id);

CREATE TABLE carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  customer_id uuid REFERENCES customers(id),
  session_id text,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX carts_store_id_idx ON carts(store_id);
CREATE INDEX carts_session_id_idx ON carts(session_id);
CREATE INDEX carts_customer_id_idx ON carts(customer_id);

CREATE TABLE cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  quantity integer NOT NULL
);

CREATE INDEX cart_items_cart_id_idx ON cart_items(cart_id);

CREATE TYPE order_status AS ENUM (
  'PENDING_PAYMENT','PAID','PROCESSING','SUPPLIER_SELECTION',
  'AWAITING_SUPPLIER_CONFIRMATION','SUPPLIER_CONFIRMED','SHIPPED',
  'IN_TRANSIT','OUT_FOR_DELIVERY','DELIVERED','CANCELLED','FAILED',
  'REFUND_PENDING','REFUNDED','REQUIRES_ATTENTION'
);
CREATE TYPE payment_status AS ENUM ('UNPAID','PAID','PARTIALLY_PAID','REFUNDED','FAILED');
CREATE TYPE fulfillment_status AS ENUM ('NOT_FULFILLED','PENDING','PARTIAL_FULFILLED','FULFILLED');

CREATE TABLE orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  status order_status NOT NULL DEFAULT 'PENDING_PAYMENT',
  payment_status payment_status NOT NULL DEFAULT 'UNPAID',
  fulfillment_status fulfillment_status NOT NULL DEFAULT 'NOT_FULFILLED',
  currency text NOT NULL DEFAULT 'NGN',
  subtotal real NOT NULL,
  shipping_total real NOT NULL,
  tax_total real NOT NULL,
  discount_total real NOT NULL,
  total real NOT NULL,
  paid_amount real NOT NULL DEFAULT 0,
  notes text,
  customer_note text,
  idempotency_key text,
  placed_at timestamptz,
  paid_at timestamptz,
  fulfilled_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX orders_store_id_idx ON orders(store_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_payment_status_idx ON orders(payment_status);
CREATE UNIQUE INDEX orders_order_number_unique ON orders(order_number);
CREATE INDEX orders_idempotency_key_idx ON orders(idempotency_key);
CREATE INDEX orders_created_at_idx ON orders(created_at);

CREATE TABLE order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES products(id),
  variant_id uuid REFERENCES product_variants(id),
  supplier_offer_id uuid REFERENCES supplier_offers(id),
  supplier_order_item_id text,
  title text NOT NULL,
  sku text,
  quantity integer NOT NULL,
  unit_price real NOT NULL,
  total real NOT NULL,
  cost real
);

CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_supplier_offer_id_idx ON order_items(supplier_offer_id);

CREATE TYPE supplier_order_status AS ENUM ('PENDING','SUBMITTED','CONFIRMED','REJECTED','CANCELLED','SHIPPED','DELIVERED','FAILED');

CREATE TABLE supplier_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  supplier_id uuid NOT NULL REFERENCES suppliers(id) ON DELETE CASCADE,
  connection_id uuid NOT NULL REFERENCES supplier_connections(id) ON DELETE CASCADE,
  external_order_id text,
  status supplier_order_status NOT NULL DEFAULT 'PENDING',
  total real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  shipping_total real,
  customer_address jsonb,
  items jsonb,
  tracking_number text,
  tracking_url text,
  shipped_at timestamptz,
  delivered_at timestamptz,
  error text,
  retry_count integer NOT NULL DEFAULT 0,
  idempotency_key text UNIQUE NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplier_orders_order_id_idx ON supplier_orders(order_id);
CREATE INDEX supplier_orders_supplier_id_idx ON supplier_orders(supplier_id);
CREATE INDEX supplier_orders_external_order_id_idx ON supplier_orders(external_order_id);
CREATE INDEX supplier_orders_status_idx ON supplier_orders(status);
CREATE UNIQUE INDEX supplier_orders_idempotency_key_unique ON supplier_orders(idempotency_key);

CREATE TABLE supplier_order_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_order_id uuid NOT NULL REFERENCES supplier_orders(id) ON DELETE CASCADE,
  type text NOT NULL,
  payload jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX supplier_order_events_supplier_order_id_idx ON supplier_order_events(supplier_order_id);

CREATE TABLE fulfillments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  supplier_order_id uuid REFERENCES supplier_orders(id),
  tracking_number text,
  tracking_url text,
  estimated_delivery timestamptz,
  delivered_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX fulfillments_order_id_unique ON fulfillments(order_id);
CREATE INDEX fulfillments_tracking_number_idx ON fulfillments(tracking_number);

CREATE TABLE tracking_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fulfillment_id uuid NOT NULL REFERENCES fulfillments(id) ON DELETE CASCADE,
  status text NOT NULL,
  location text,
  occurred_at timestamptz NOT NULL,
  description text
);

CREATE INDEX tracking_events_fulfillment_id_idx ON tracking_events(fulfillment_id);
CREATE INDEX tracking_events_occurred_at_idx ON tracking_events(occurred_at);

-- ===========================================================================
-- PAYMENTS & REFUNDS
-- ===========================================================================

CREATE TYPE payment_provider AS ENUM ('PAYSTACK','FLUTTERWAVE','STRIPE','MANUAL');
CREATE TYPE payment_transaction_status AS ENUM ('PENDING','SUCCESS','FAILED','REFUNDED');
CREATE TYPE refund_status AS ENUM ('PENDING','APPROVED','PROCESSED','REJECTED');

CREATE TABLE payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider payment_provider NOT NULL,
  external_transaction_id text,
  amount real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  status payment_transaction_status NOT NULL DEFAULT 'PENDING',
  fee real,
  gateway_response jsonb,
  verified_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_order_id_idx ON payments(order_id);
CREATE INDEX payments_external_transaction_id_idx ON payments(external_transaction_id);
CREATE INDEX payments_status_idx ON payments(status);

CREATE TABLE refunds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  payment_id uuid REFERENCES payments(id) ON DELETE SET NULL,
  amount real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  reason text,
  status refund_status NOT NULL DEFAULT 'PENDING',
  external_refund_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX refunds_order_id_idx ON refunds(order_id);
CREATE INDEX refunds_status_idx ON refunds(status);

-- ===========================================================================
-- SUBSCRIPTIONS & BILLING
-- ===========================================================================

CREATE TYPE subscription_status AS ENUM ('ACTIVE','PAST_DUE','CANCELED','TRIALING','PAUSED');

CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  plan text NOT NULL,
  status subscription_status NOT NULL DEFAULT 'ACTIVE',
  price real NOT NULL,
  currency text NOT NULL DEFAULT 'NGN',
  interval text NOT NULL,
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean NOT NULL DEFAULT false,
  canceled_at timestamptz,
  provider text,
  provider_subscription_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX subscriptions_store_id_idx ON subscriptions(store_id);
CREATE INDEX subscriptions_status_idx ON subscriptions(status);
CREATE INDEX subscriptions_plan_idx ON subscriptions(plan);

-- ===========================================================================
-- NOTIFICATIONS
-- ===========================================================================

CREATE TABLE notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text,
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_store_id_idx ON notifications(store_id);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);

-- ===========================================================================
-- BACKGROUND JOBS (audit mirror of pg-boss)
-- ===========================================================================

CREATE TYPE job_status AS ENUM ('PENDING','COMPLETED','FAILED');

CREATE TABLE background_job_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  status job_status NOT NULL DEFAULT 'PENDING',
  payload jsonb,
  error text,
  retries integer NOT NULL DEFAULT 0,
  max_retries integer NOT NULL DEFAULT 3,
  run_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX background_job_records_name_idx ON background_job_records(name);
CREATE INDEX background_job_records_status_idx ON background_job_records(status);

-- ===========================================================================
-- AUTOMATION & EXCEPTIONS
-- ===========================================================================

CREATE TABLE automation_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL,
  config jsonb,
  is_active boolean NOT NULL DEFAULT true,
  last_run_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX automation_rules_store_id_idx ON automation_rules(store_id);
CREATE INDEX automation_rules_is_active_idx ON automation_rules(is_active);

CREATE TYPE exception_status AS ENUM ('OPEN','RESOLVED','DISMISSED');

CREATE TABLE order_exceptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  reason text NOT NULL,
  status exception_status NOT NULL DEFAULT 'OPEN',
  resolution text,
  resolved_by uuid REFERENCES users(id),
  resolved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX order_exceptions_order_id_idx ON order_exceptions(order_id);
CREATE INDEX order_exceptions_status_idx ON order_exceptions(status);

-- ===========================================================================
-- AI
-- ===========================================================================

CREATE TABLE ai_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  title text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_conversations_user_id_idx ON ai_conversations(user_id);
CREATE INDEX ai_conversations_store_id_idx ON ai_conversations(store_id);

CREATE TABLE ai_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES ai_conversations(id) ON DELETE CASCADE,
  role text NOT NULL,
  content text NOT NULL,
  tool_calls jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_messages_conversation_id_idx ON ai_messages(conversation_id);

CREATE TABLE ai_action_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  action text NOT NULL,
  details jsonb,
  approved_by uuid REFERENCES users(id),
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ai_action_logs_store_id_idx ON ai_action_logs(store_id);
CREATE INDEX ai_action_logs_user_id_idx ON ai_action_logs(user_id);
CREATE INDEX ai_action_logs_action_idx ON ai_action_logs(action);
CREATE INDEX ai_action_logs_created_at_idx ON ai_action_logs(created_at);

-- ===========================================================================
-- AUDIT LOG
-- ===========================================================================

CREATE TABLE audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id),
  store_id uuid REFERENCES stores(id) ON DELETE CASCADE,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX audit_logs_store_id_idx ON audit_logs(store_id);
CREATE INDEX audit_logs_user_id_idx ON audit_logs(user_id);
CREATE INDEX audit_logs_action_idx ON audit_logs(action);
CREATE INDEX audit_logs_created_at_idx ON audit_logs(created_at);

-- ===========================================================================
-- STOREFRONT
-- ===========================================================================

CREATE TABLE collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  image text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX collections_store_slug_unique ON collections(store_id, slug);
CREATE INDEX collections_store_id_idx ON collections(store_id);

-- ===========================================================================
-- ANALYTICS
-- ===========================================================================

CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  name text NOT NULL,
  properties jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX analytics_events_store_id_idx ON analytics_events(store_id);
CREATE INDEX analytics_events_name_idx ON analytics_events(name);
CREATE INDEX analytics_events_occurred_at_idx ON analytics_events(occurred_at);
