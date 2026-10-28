# CompareX commerce rollout

## Intended customer journey
1. Customer builds a multi-service package in Package Builder.
2. Customer continues to the CompareX checkout and reviews the estimated monthly total.
3. Customer enters the minimum contact details needed for an order draft.
4. After provider contracts, fulfillment integrations, privacy/legal review, and billing are ready, CompareX can enable a real checkout.
5. The order record tracks each provider line, provider confirmation, payment state, and cancellations/refunds.

## Current implementation state
- Package Builder now has a primary "Continue to checkout" action that carries the selected package to `/checkout`.
- Checkout reviews the selected line items and has a customer contact form.
- `POST /api/orders` validates fields and line items server-side.
- The endpoint deliberately refuses to save orders unless `COMPAREX_ORDERS_ENABLED=true`, and it also requires Supabase server credentials.
- The Supabase migration `supabase/migrations/202610280001_package_order_drafts.sql` defines a private draft-order table with RLS enabled and no client policies.
- Payment is not implemented or enabled. No customer is charged. Client-supplied prices are estimates only and must never be used as payment amounts.
- `/privacy` is a pre-launch readiness note, not a complete GDPR privacy notice.

## Required deployment configuration
Use Vercel Environment Variables; never commit secrets:
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only; never use a `NEXT_PUBLIC_` prefix)
- `COMPAREX_ORDERS_ENABLED=true` only after the database migration has run, privacy and retention documents have been reviewed, access controls are verified, and operational ownership is established.

Keep `COMPAREX_ORDERS_ENABLED` unset or false for now. The API must stay closed until the pre-launch requirements below are completed.

## Before real payments
1. Decide the legal seller / merchant of record and customer-contracting party.
2. Obtain written provider agreements and approved APIs or fulfillment processes for each service type.
3. Decide how to handle one-time charges vs recurring monthly subscriptions, taxes, deposits, refunds, cancellations, partial failures, and provider payouts.
4. Choose and configure a supported marketplace payments setup (Stripe Connect may fit if providers receive funds through the platform); complete provider onboarding/KYC where required.
5. Calculate payable totals on the server from trusted, current provider prices. Never trust price/amount values sent by the browser.
6. Implement Stripe Checkout or Elements on the server, webhook signature verification, idempotency, order/payment state transitions, and refund/cancellation workflows.
7. Add authentication, customer order history, account deletion, rate limiting, abuse protection, audit logging, and data-retention jobs.
8. Complete GDPR privacy notice, terms of service, cancellation/withdrawal rules, provider terms, support contacts, and required consumer disclosures. Have counsel review before collecting live customer data.
9. Test the entire flow in Stripe test mode, including duplicate webhooks, declined payments, partial provider fulfillment, refunds, and abandoned checkout.
10. Only then enable order intake and payments for real customers.

## Important
Do not enable the order endpoint merely because environment variables exist. Enabling it is an operational/legal launch decision, not just a technical switch. Do not store payment card details in CompareX; use the payment provider's hosted/secure components.
