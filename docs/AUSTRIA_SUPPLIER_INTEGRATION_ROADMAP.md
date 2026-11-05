# Austria supplier integration roadmap

Updated: 5 November 2026

## Operating rule

CompareX is the intended seller to the student. A provider listing is not a purchasable product until CompareX has written authorisation to resell it, an agreed wholesale/customer price, a valid customer contract flow, and a reliable activation or reservation process. Do not enable checkout for catalogue rows marked as comparison-only or partner discussion.

## Rollout sequence

### Stage 1 — Student housing (first commercial pilot)

**Initial supplier targets**
- Home4students — Vienna reservations contact: wien_info@home4students.at; cooperation / marketing contact: marketing@home4students.at.
- STUWO — central contact: info@stuwo.at.
- OeAD student housing — establish a commercial contact through its official company contact route; it publicly describes partnerships with other student accommodation providers, but this is not evidence that it accepts third-party resellers.
- Akademikerhilfe and ÖJAB — second wave after the first pilot.

**Best first integration:** a human-assisted reservation workflow, not scraping or pretending to have live inventory. Supplier sends a controlled rate/availability sheet or confirms each reservation. CompareX creates a pending order, supplier confirms availability and the final price, then CompareX captures payment or authorises payment according to an agreed contract. The customer must see whether the room is merely requested or actually confirmed.

**Questions for supplier:** Can CompareX contract with the student and resell the room in its own name? Can it collect the full accommodation fee? What commission/wholesale rate applies? Who is the accommodation provider of record? Who holds the deposit? Who handles cancellations, refunds, damage claims, residence registration documents and emergency support? Is inventory available by API, extranet, CSV or email confirmation?

Sources: https://www.home4students.at/kontakt/ · https://www.stuwo.at/kontakt/ · https://www.oeadstudenthousing.at/en/oead-student-housing/about-us/

### Stage 2 — Mobile plans

**Initial supplier targets**
- Drei Wholesale — strongest publicly documented technical route. Drei describes Full MVNO, Light MVNO and branded-reselling models; its wholesale contact is mvno@drei.com.
- Magenta Business Partner programme — published partner route and contact sales.businesspartner@magenta.at; confirm whether online retail and CompareX as contractual seller are allowed.
- yesss! — published retail distribution network (more than 2,200 locations for starter packs); ask A1/yesss! whether it offers a digital distribution / branded-reseller agreement. Existing retail distribution is not proof of an online reseller API.
- spusu — direct business development enquiry; no public reseller programme was confirmed in this research.

**Best first integration:** a branded-reseller / light-MVNO agreement where the carrier owns the network and SIM provisioning while CompareX owns the customer-facing package and sales relationship. Do not build a SIM activation flow before the supplier defines identity verification, number porting, eSIM/SIM fulfilment, cooling-off, cancellation and support responsibilities.

Sources: https://www.drei.at/de/business/wholesale/ · https://www.drei.at/de/business/kontakt/ · https://www.magenta.at/business/unternehmen/partner · https://www.yesss.at/handelspartner · https://www.spusu.at/impressum

### Stage 3 — Transport

**Initial supplier:** Wiener Linien.

Wiener Linien publicly describes a B2B ticket distribution interface that allows companies to sell selected tickets (including single, 24-hour and 7-day tickets) through their own webshop/app after technical review and contract. Contact: business@wienerlinien.at.

**Best first integration:** apply for the ticket distribution interface, implement their documented API and ticket delivery/validation process, and start with the ticket types covered by the agreement. The existing 31-day and annual passes in the comparison catalogue must not be assumed to be available through that interface.

Source: https://www.wienerlinien.at/b2b/ticketvertriebsschnittstelle

### Stage 4 — Gym memberships

**Initial supplier targets:** RSG Group / McFIT and FITINN.

RSG provides a Corporate Fitness and Brand & Strategic Partnerships contact route. Its public McFIT franchise offer is for operators opening gyms in markets where the brand does not already operate company-owned locations; that is not the same as a reseller agreement for memberships in Austria. Ask specifically for a corporate/student membership distribution contract.

**Best first integration:** supplier-issued student/corporate membership codes or a partner enrolment API, with the supplier remaining responsible for access credentials and studio operations. CompareX must receive written authority to charge for memberships in its own name before selling them.

Sources: https://rsggroup.com/en/contact/ · https://www.mcfit.com/at/franchise

### Stage 5 — Streaming subscriptions

**Initial route:** approach distributors / telecom bundle aggregators rather than assuming Netflix or Disney+ will provide direct reseller APIs to a small startup.

A1 publicly launched A1 Select in Austria with streaming and digital services, and previously announced a multiyear Netflix partnership. This proves that operator-level bundle partnerships exist, not that CompareX can resell those subscriptions directly. Ask A1 and other authorised aggregators about wholesale access, voucher inventory, gift codes, recurring billing, territory and support rights.

**Best first integration:** authorised voucher/code distribution or an aggregator API with clear reseller rights. Avoid collecting a customer's streaming password or promising to activate an account without an authorised provisioning flow.

Sources: https://newsroom.a1.net/news-a1-startet-a1-select-die-einzigartige-abo-plattform-fuer-digitale-services-in-oesterreich?id=246701&menueid=12657 · https://newsroom.a1.com/news-a1-group-and-netflix-announce-strategic-multiyear-partnership?id=187404&l=english&menueid=14594

## Technical integration pattern

Each supplier integration must implement a common server-side contract:

1. `getCatalogue()` — supplier-approved products, terms, price, billing period and last verification.
2. `checkAvailability(product, customerSelection)` — fresh availability or a clearly marked manual-confirmation response.
3. `createReservation(order, item)` — create a reservation / activation request using an idempotency key.
4. `getReservationStatus(reference)` — reconcile supplier state.
5. `cancelReservation(reference)` — cancellation where contractually permitted.
6. `handleSupplierWebhook(event)` — verify authenticity and deduplicate events where supported.

Adapters must be isolated per supplier. A failed supplier API must never be interpreted as a confirmed booking. Use a manual-operations adapter until a real partner API is contracted and documented.

## Supplier onboarding checklist

- Legal entity and contracting party verified.
- Resale / agency / branded-reseller rights explicitly documented.
- Product and territory scope agreed.
- Wholesale cost, retail price, VAT treatment, payment timing and margin agreed.
- API / portal / CSV / manual workflow documented; credentials held only in server secrets.
- Inventory, price freshness and outage behaviour agreed.
- Customer terms, cancellation, refunds, complaints and support ownership agreed.
- Required customer data and lawful transfer / retention agreed.
- Test credentials and sandbox or manual test process received.
- End-to-end test completed before a product is marked purchasable.

## Current implementation status

- Existing provider API routes are comparison feeds, not partner integrations.
- Their data is not evidence of contracted stock or resale rights.
- Checkout/order endpoints only accept server-owned canonical starter-catalogue IDs. They deliberately reject dynamic provider feed IDs.
- Production payments and order collection remain disabled.
- The next engineering milestone is to apply the new supplier/order database migration, then add a server-side supplier registry and manual-confirmation workflow. Do not switch any supplier to sellable until its agreement and operational checklist are approved.
