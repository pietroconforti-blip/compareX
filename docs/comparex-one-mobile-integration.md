# CompareX One — Mobile provider integration

## Current state

The first CompareX One preview adds the customer account/profile foundation and a mobile setup draft workflow. The mobile catalogue uses the existing CompareX offer endpoint. spusu and yesss! are **not connected** to application APIs, and no provider partnership or commission agreement is implied.

## Provider adapter contract

Implement a provider adapter only after written provider authorisation, API documentation, sandbox credentials and the applicable data-processing / commercial agreements are in place.

The adapter must support, where the provider allows it:
1. Fetch and refresh catalogue data.
2. Check eligibility and service availability.
3. Create an application with an idempotency key.
4. Trigger the provider's identity-verification flow.
5. Create or activate the provider contract only after explicit customer confirmation and provider approval.
6. Receive signed status webhooks and reconcile events idempotently.
7. Support cancellation / withdrawal workflows and provider references.

## Security requirements

- Provider secrets belong in server-only Vercel environment variables, never in NEXT_PUBLIC variables or browser code.
- Authenticate inbound webhooks using the provider's documented signature scheme and reject replayed events.
- Enforce per-user RLS for customer profiles, packages, application drafts and data-sharing consent records.
- Request and share only fields required by the specific provider and application.
- Record the provider, purpose, notice version and timestamp before transmitting personal data.
- Never store card numbers, CVVs, provider account passwords or identity-document images in CompareX.
- Use provider-hosted identity verification and payment components where available.
- Keep the student-facing flow free under the current referral business model. Students pay providers; providers separately settle agreed referral commissions with CompareX.

## Activation gate

A provider may be marked sandbox or live only after the commercial relationship, technical credentials, security review and end-to-end test are complete. Until then, CompareX must label the selected tariff as a saved draft and must not claim that an application or contract has been submitted.
