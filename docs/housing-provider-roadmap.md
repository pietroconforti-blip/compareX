# CompareX — accommodation supplier integration roadmap

Last reviewed: 2026-10-25

## Important status rule

Do not scrape private inventory or represent a provider as connected without permission. A provider is live only after written commercial authorization, working credentials or a contracted direct feed, and successful technical tests. This document is a prospect list, not proof of integration.

## Priority A: student and mid-term housing

1. **HousingAnywhere** — official partnership routes include marketplace inventory feeds, affiliates, co-branded pages and corporate/university partnerships. Ask for a feed/API, booking creation, cancellations, Vienna inventory and permission to collect payment inside CompareX.
   - https://info.housinganywhere.com/partners
   - https://info.housinganywhere.com/affiliates

2. **Spotahome** — official partner programme for education, companies and relocation. Its partner page says widget/API options may be available to premium partners with high volume (over 50 bookings/year); eligibility and Vienna coverage must be confirmed.
   - https://www.spotahome.com/become-a-partner-of-spotahome

3. **Direct student-residence operators** — OeAD Student Housing, STUWO, home4students, ÖJAB, WIHAST, Akademikerhilfe and other Vienna providers. No public booking API has been verified for these operators in this project. Ask for a partner contract, availability feed, booking workflow, commission/net rates and settlement terms.
   - OeAD: https://www.oeadstudenthousing.at/
   - STUWO: https://www.stuwo.at/en/
   - home4students: https://www.home4students.at/
   - ÖJAB: https://www.oejab.at/
   - WIHAST: https://www.wihast.at/
   - Vienna official student residence overview: https://www.wien.gv.at/en/housing/students-halls-of-residences

## Priority B: broader accommodation inventory

4. **Booking.com Demand API** — partner application and approval required. Supports different integration models including Search/Look/Book, but the agreement must permit the exact integration. A single CompareX package checkout is not assumed to be supported.
   - https://developers.booking.com/demand/docs
   - https://developers.booking.com/demand/docs/getting-started/prerequisites

5. **Expedia Group Rapid** — partner application, launch requirements and site review required. Confirm package pricing, markup, merchant-of-record and payment model in writing.
   - https://developers.expediagroup.com/rapid/setup
   - https://developers.expediagroup.com/rapid/setup/launch-requirements/lodging-launch-reqs

6. **Amadeus Hotels** — investigate the correct product tier and production booking access. Availability, booking and payment rights depend on product and agreement.
   - https://developers.amadeus.com/enterprise/category/hotel
   - https://admin.developers.amadeus.com/self-service/apis-docs/guides/developer-guides/resources/hotels/

7. **Hostelworld** — useful mainly for short-stay hostels, not semester-long residences. Its official partner programme has feeds and API access case-by-case.
   - https://partners.hostelworld.com/solutions/

8. **Homestay.com** — affiliate routes mention tracked links and an API feed. Confirm feed access, commission and whether CompareX may collect the full package payment.
   - https://www.homestay.com/it/affiliates

## Questions for every provider

1. Can CompareX search live availability and current prices by dates, guests, stay length and room type?
2. Can customers book without leaving CompareX, and can we create/cancel/amend bookings through API or partner tooling?
3. Who is merchant of record and who contracts with the customer?
4. May CompareX collect the entire package price and settle the accommodation provider separately?
5. Which settlement methods and timing are allowed (net terms, commission, virtual credit card, deposit, prepayment, pay-at-property)?
6. Is a transparent package markup allowed? Are there rate-parity, display, branding or resale restrictions?
7. What is the cancellation/refund flow, and who bears chargebacks and no-show risk?
8. Are there minimum volumes, company-registration requirements, security or launch-review requirements?
9. Can live accommodation data be used in a package that includes non-travel services?
10. Is there a sandbox, API documentation and technical contact?

## Recommended architecture

- Define a provider adapter interface for search, quote, create booking, retrieve booking, cancel/amend and payment requirements.
- Track capabilities such as live search, quote, create booking, cancellation, partner checkout, package resale, markup permission, settlement method and approval status.
- Normalize property ID, room/rate ID, stay dates, currency, taxes, deposit, cancellation policy, payment timing, quote expiration and data source.
- Use one customer-facing order with separate supplier line items, each with its own provider reference and state.
- Keep secrets in server-side Vercel environment variables. Never send supplier API keys to the browser or commit them to Git.
- Distinguish static public information, affiliate links, live search results, availability-confirmed quotes and confirmed bookings.

## Single-checkout gate

Do not enable CompareX checkout for accommodation until the supplier contract and selected offer explicitly permit the intended payment flow. Reserve/confirm suppliers in a controlled sequence and avoid capturing the customer's full payment until required reservations are secured or an approved alternative flow exists. Implement idempotency, durable retries, reconciliation and void/refund handling for partial failures.

## Outreach order

1. HousingAnywhere — inventory feed and embedded booking/payment rights.
2. Spotahome — partner access/API eligibility and checkout terms.
3. OeAD, STUWO and home4students — direct student-residence distribution agreements.
4. Booking.com Demand API — broad inventory and integrated booking.
5. Expedia Rapid — second broad inventory channel.
6. ÖJAB, WIHAST, Akademikerhilfe — additional direct residence inventory.
7. Amadeus, Hostelworld and Homestay.com — complementary inventory depending on stay type.
