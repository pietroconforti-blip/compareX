# CompareX direct-seller operating model

## Decision

CompareX is intended to act as the seller to the customer (direct-seller / reseller model). The customer contract and checkout should be with CompareX, not with each provider.

This is an architectural decision, not proof that CompareX currently has the right to resell any listed service. Each supplier must explicitly authorise the resale, bundling, pricing, marketing, payment collection and customer-support model before that supplier's offer can be sold.

## Customer journey

1. Customer chooses a destination, categories and budget.
2. CompareX recommends a package from its own curated catalogue.
3. The customer sees the full price, billing frequency, term, fees, availability and cancellation conditions.
4. CompareX validates the package and creates a server-side order snapshot.
5. The customer accepts CompareX's terms and pays CompareX through its payment provider.
6. CompareX confirms payment through a signed webhook.
7. CompareX fulfils each line item through an authorised supplier integration or a controlled operations workflow.
8. CompareX sends one order confirmation and remains responsible for first-line customer support, refunds and cancellation handling under its customer terms.

## Required product data before an offer is sellable

Every sellable offer needs:
- Stable server-generated ID and supplier SKU/reference.
- Supplier and written resale authorisation status.
- Customer-facing title, description and category.
- Country, eligibility and service coverage.
- Verified customer price, currency, billing frequency and any one-time fees.
- Supplier wholesale cost and expected gross margin (internal only).
- Contract duration, renewal, cancellation and refund rules.
- Availability / capacity confirmation method.
- Fulfilment method, required customer data and expected activation time.
- Last verification timestamp and the person/process responsible for updates.

Offers that are only comparison references, indicative averages, search portals or unverified provider listings must remain non-purchasable.

## Order and payment states

Recommended order lifecycle:
- `draft`: package assembled, no payment.
- `awaiting_payment`: server has priced the order and issued a payment session.
- `paid`: payment provider webhook verified.
- `fulfilment_pending`: paid order queued for supplier fulfilment.
- `partially_fulfilled`: some line items activated, others unresolved.
- `fulfilled`: all line items fulfilled.
- `cancellation_requested`: customer has requested cancellation.
- `refund_pending`: refund requested / being processed.
- `refunded`: refund confirmed.
- `failed`: payment or fulfilment failed and requires resolution.

Payment state must be tracked separately from fulfilment state. A successful payment must never be treated as proof that a supplier activated a service.

## Technical controls

- The browser sends offer IDs and customer choices only; it never sets trusted prices, discounts, taxes or totals.
- The server resolves a versioned product/price snapshot and stores it with the order.
- Payment amounts are calculated from that snapshot.
- Signed, idempotent webhooks update payment state.
- Fulfilment actions are idempotent and retried safely; manual exceptions are visible to operations.
- Refunds and cancellations are auditable and tied to the original order and payment.
- Secrets remain server-side. Customer data is minimised and retained only under an approved privacy policy.
- Test mode and production mode are strictly separated.

## Launch gates

Do not enable production payments or order collection until all of the following are complete:
1. Written supplier resale agreements and a documented fulfilment route for every sellable line item.
2. A reviewed customer contract, pricing display, tax/VAT treatment, consumer withdrawal/cancellation/refund process and required business disclosures for the markets served.
3. A complete privacy notice, lawful data flows, retention schedule and supplier/data-processing agreements.
4. Server-owned catalogue, price snapshots and stock/availability checks.
5. Payment webhooks, idempotency, reconciliation, refunds and customer receipts.
6. Order operations dashboard, supplier exception handling and customer support process.
7. End-to-end tests for successful payment, declined payment, duplicate webhook, partial fulfilment, cancellation and refund.

## Current implementation boundary

The starter catalogue is a comparison dataset, not a wholesale catalogue. Dynamic provider listings do not yet have stable server-side purchase records. Checkout and order collection therefore remain test-only / disabled, and unknown or unverified offer IDs are rejected. Do not remove these safeguards merely to make the checkout button appear functional.
