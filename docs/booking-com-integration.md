# Booking.com accommodation integration — CompareX

## Current status

**Not live. No real availability search, reservation, or payment is performed by CompareX through this scaffold.** The status endpoint only checks whether server-side configuration values exist. It cannot verify partner approval or whether credentials work.

Official documentation:
- Demand API overview: https://developers.booking.com/demand/docs/getting-started/overview
- Prerequisites: https://developers.booking.com/demand/docs/getting-started/prerequisites
- Demand API payment overview: https://developers.booking.com/demand/docs/payments/overview
- Accommodation tutorial: https://demand-api.eu.redocly.app/demand/docs/accommodations/accommodation-tutorial

## Gate 1 — Commercial access

Before coding live booking, CompareX must:
1. Apply and be accepted as a Booking.com Managed Affiliate Partner.
2. Obtain the applicable agreement and Partner Centre access from Booking.com.
3. Obtain an API key and `X-Affiliate-Id`.
4. Confirm in writing that the intended CompareX business model is permitted, including any package markup, display of inventory/prices, customer support duties, and the intended checkout/payment flow.
5. Complete sandbox testing and any required review/certification before going live.

Do not commit API credentials to Git. Configure them as Vercel server-side environment variables only.

## Gate 2 — Confirm the actual payment model

Booking.com Demand API supports different accommodation payment arrangements. Depending on the offer and partner configuration, payment can be collected online, by Booking.com, by a partner using supported mechanisms (including virtual credit card flows), or at the property; some bookings have scheduled or split payments.

Therefore, a single payment collected by CompareX **cannot be assumed to be supported for every accommodation offer**. Before accepting customer money, validate the exact offer's payment timing/method and obtain Booking.com's written approval for the intended collection and settlement model. A property that requires payment at check-in is not equivalent to a prepaid booking that CompareX can bundle into its own checkout.

## Gate 3 — Live booking lifecycle

Implement the real flow only after access is granted:
1. Search accommodation using current check-in/check-out dates and guest/room counts.
2. Fetch details and current price/payment/cancellation policies.
3. Preview the order and verify the supported payment requirements.
4. Show the final total, currency, fees, taxes, cancellation policy and any amount payable at the property.
5. Use the supported order-creation flow only after the user explicitly confirms.
6. Persist provider order IDs and reservation references; verify the returned booking status.
7. Handle timeouts, retries and idempotency without creating duplicate reservations.
8. Support cancellations/amendments only where the API and fare rules permit them.
9. Reconcile supplier charges, customer receipts, refunds, disputes and settlement.

Do not treat a search result or order preview as a confirmed reservation. Do not tell the customer that accommodation is booked until the provider returns a confirmed booking state.

## Required environment variables

Set these only in Vercel Project Settings → Environment Variables, for server-side use:

- `BOOKING_DEMAND_API_ENABLED=false` (keep false until the partner agreement and technical checks are complete)
- `BOOKING_DEMAND_API_KEY` (secret API token supplied through the partner programme)
- `BOOKING_AFFILIATE_ID` (the assigned affiliate identifier)

The status endpoint is `GET /api/booking-com/status`. It reports configuration readiness only and intentionally always reports partner approval, live inventory, live booking, and checkout as not validated/disabled. It never returns credential values.

## CompareX checkout design

Recommended order states:
- `DRAFT`
- `INVENTORY_CHECKED`
- `PAYMENT_AUTHORIZED`
- `SUPPLIER_BOOKING_PENDING`
- `CONFIRMED`
- `PARTIALLY_FAILED`
- `CANCELLATION_PENDING`
- `REFUND_PENDING`
- `REFUNDED`

Store the quoted supplier price, currency, quote timestamp, cancellation terms, payment schedule and provider IDs as an immutable order-item snapshot. Use idempotency keys and a durable job/outbox pattern for supplier actions and payment webhooks.

For a package, do not capture the customer's full payment until all necessary supplier reservations are secured or a legally and commercially approved alternative flow is in place. If a supplier booking fails after payment authorization, void the authorization where possible; if funds were captured, execute the applicable refund/compensation policy. Multi-supplier packages may trigger additional consumer-law obligations; obtain Austrian/EU legal advice before selling.

## Launch checklist

- [ ] Booking.com Managed Affiliate Partner acceptance and signed agreement
- [ ] Written approval for intended resale/markup and payment/settlement model
- [ ] Partner Centre credentials configured only in Vercel
- [ ] Sandbox search, details, preview, booking, cancellation and error handling tested
- [ ] Confirmation that the exact accommodation offer supports the required payment flow
- [ ] Customer terms, privacy notice, cancellation/refund policy, invoicing and support process reviewed
- [ ] Security review, rate limits, logging with no card data/secrets, and production approval
- [ ] Only then enable production integration and checkout
