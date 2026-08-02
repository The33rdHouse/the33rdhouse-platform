# The 33rd House — Release 1 Stripe and Entitlement Specification

**Status:** Implementation-ready, externally gated  
**Version:** 1.0.0-draft  
**Date:** 2026-08-03  
**Canonical owner:** The 33rd House / authorised owner  
**External gate:** Stripe account approval and connection  

## 1. Release boundary

Release 1 contains only:

- Seeker free access
- Pro Codex subscription at A$15 monthly
- Pro Codex subscription at A$150 annually
- One premium branch at A$49 one-time
- Five guided agent actions per active Pro billing period
- Stripe Checkout, Billing, Customer Portal, signed webhooks and server-side entitlements

Release 1 explicitly excludes marketplace functionality, Stripe Connect, metered billing, sellable credit packs, team plans and credential monetisation.

## 2. Product and price schema

### 2.1 Pro Codex

Product:

```yaml
name: Pro Codex
type: service
billing_model: subscription
statement_descriptor: THE33RDHOUSE
tax_code: TBD_AFTER_STRIPE_TAX_REVIEW
metadata:
  product_key: pro_codex
  entitlement_key: codex.pro
  agent_actions_monthly: "5"
  release: "1"
  registry_version: "0.1"
```

Prices:

```yaml
- internal_key: price_pro_monthly_aud
  currency: aud
  unit_amount: 1500
  recurring_interval: month
  lookup_key: pro_monthly_aud

- internal_key: price_pro_annual_aud
  currency: aud
  unit_amount: 15000
  recurring_interval: year
  lookup_key: pro_annual_aud
```

### 2.2 Premium branch

Launch product: **A Dangerous Man Under Control**

```yaml
name: A Dangerous Man Under Control
type: service
billing_model: one_time
metadata:
  product_key: premium_branch_dangerous_man
  entitlement_key: branch.dangerous_man
  access_type: lifetime
  release: "1"
  content_version: "1"
```

Price:

```yaml
internal_key: price_premium_branch_dangerous_man_aud
currency: aud
unit_amount: 4900
lookup_key: dangerous_man_branch_aud
```

The Leadership Pipeline must not be sold as a credential system while its registry remains owner-review-required.

## 3. Server-controlled offer catalogue

The browser submits only an approved `offer_key`. It must never submit or control a Stripe price ID, entitlement key or amount.

```ts
const OFFERS = {
  pro_monthly: {
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_PRO_MONTHLY_AUD",
    entitlementKey: "codex.pro",
  },
  pro_annual: {
    mode: "subscription",
    priceEnv: "STRIPE_PRICE_PRO_ANNUAL_AUD",
    entitlementKey: "codex.pro",
  },
  dangerous_man_branch: {
    mode: "payment",
    priceEnv: "STRIPE_PRICE_PREMIUM_BRANCH_AUD",
    entitlementKey: "branch.dangerous_man",
  },
} as const;
```

## 4. Checkout configuration

### 4.1 Subscription checkout

```yaml
mode: subscription
quantity: 1
allow_promotion_codes: false
billing_address_collection: auto
automatic_tax: false
client_reference_id: INTERNAL_USER_ID
metadata:
  user_id: INTERNAL_USER_ID
  offer_key: CANONICAL_OFFER_KEY
  release: "1"
```

The server selects the monthly or annual price from the allowlisted offer catalogue.

### 4.2 One-time checkout

```yaml
mode: payment
quantity: 1
client_reference_id: INTERNAL_USER_ID
metadata:
  user_id: INTERNAL_USER_ID
  offer_key: dangerous_man_branch
  release: "1"
```

## 5. Database schema

```sql
create table entitlements (
  id uuid primary key,
  user_id uuid not null,
  entitlement_key text not null,
  source_type text not null,
  source_id text not null,
  status text not null,
  starts_at timestamptz not null,
  ends_at timestamptz,
  revoked_at timestamptz,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entitlement_key, source_type, source_id)
);

create table agent_usage (
  id uuid primary key,
  user_id uuid not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  allowance integer not null default 5,
  used integer not null default 0,
  reserved integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, period_start, period_end),
  check (allowance >= 0),
  check (used >= 0),
  check (reserved >= 0),
  check (used + reserved <= allowance)
);

create table webhook_events (
  stripe_event_id text primary key,
  event_type text not null,
  payload jsonb not null,
  processing_status text not null,
  attempts integer not null default 0,
  received_at timestamptz not null default now(),
  processed_at timestamptz,
  error_message text
);
```

Additional production tables should connect internal users to Stripe customers, subscriptions, purchases and canonical products/prices.

## 6. Canonical entitlement keys

```text
codex.free
codex.pro
branch.dangerous_man
agent.guided.monthly.5
```

## 7. Access resolution

```text
Anonymous user
→ codex.free

Authenticated user with active Pro subscription
→ codex.free
→ codex.pro
→ five guided actions in the current billing period

Authenticated user with completed premium purchase
→ branch.dangerous_man

User with both
→ union of valid entitlements
```

Every protected page, API route and agent action must resolve access on the server.

## 8. Webhook architecture

Required events:

```text
checkout.session.completed
customer.subscription.created
customer.subscription.updated
customer.subscription.deleted
invoice.paid
invoice.payment_failed
charge.refunded
```

Processing contract:

1. Verify the raw request body with `STRIPE_WEBHOOK_SECRET`.
2. Insert the Stripe event ID before processing.
3. Treat a duplicate primary-key insert as an already-received event.
4. Process in a database transaction where supported.
5. Validate customer, price, subscription and internal user mappings.
6. Record success or redacted failure state.
7. Never log secrets, full payment details or unnecessary personal data.

Event effects:

- `checkout.session.completed`: link customer to user; grant a one-time branch only after payment state and allowlisted offer validation; do not independently grant subscription access.
- `customer.subscription.created`, `customer.subscription.updated`, `invoice.paid`: verify active subscription and allowlisted price; grant or refresh `codex.pro`; initialise the five-action period allowance.
- `invoice.payment_failed`: record `past_due`; apply only an approved grace-period policy.
- `customer.subscription.deleted`: end `codex.pro` at the effective cancellation time; preserve the account and separately purchased branches.
- `charge.refunded`: revoke the one-time branch on a validated full refund; partial-refund behaviour remains owner-policy-required.

## 9. Cancellation and portal policy

Launch default:

```text
cancel_at_period_end = true
```

Customer Portal may allow:

- payment-method updates
- invoice and receipt access
- cancellation at period end

Immediate cancellation is owner/support-only. Monthly/annual switching is disabled until proration rules are approved.

## 10. GST and tax gate

Public prices must use one consistent treatment, preferably GST-inclusive for an Australian consumer-facing offer, subject to accountant confirmation.

Stripe automatic tax remains disabled until the following are confirmed:

- contracting entity and ABN
- GST registration status
- tax code
- invoice treatment
- domestic and international customer treatment
- whether advertised prices include GST

The placeholder `txcd_99999999` must not be treated as an approved final tax code.

## 11. Required server-side environment variables

```text
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_PRICE_PRO_MONTHLY_AUD
STRIPE_PRICE_PRO_ANNUAL_AUD
STRIPE_PRICE_PREMIUM_BRANCH_AUD
STRIPE_CUSTOMER_PORTAL_CONFIG_ID
APP_URL
DATABASE_URL
```

No secret, webhook secret, database URL or private price-selection logic may be exposed to the browser.

## 12. Release gates

1. Healthy Vercel staging deployment
2. Canonical authentication and stable internal user IDs
3. Database migrations for customers, subscriptions, purchases, entitlements, agent usage, webhook events and audit records
4. Stripe approval and connection
5. Two products and three real Stripe prices
6. Server-created Checkout Sessions
7. Signed and idempotent webhook processing
8. Server-side entitlement middleware
9. Customer Portal configuration
10. Purchase, renewal, failure, cancellation and refund tests
11. Staging soak
12. Explicit owner approval for production

## 13. External-gate rule

Stripe is an external gate, not an engineering stop condition. Before Stripe approval, engineering may complete migrations, interfaces, allowlisted offer mapping, webhook-domain logic, tests, mocked Stripe adapters, access-control middleware and staging documentation. No live charge, production price ID or customer entitlement may be represented as active until Stripe is connected and verified.
