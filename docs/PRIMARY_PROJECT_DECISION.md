# CompareX primary project decision

**Status:** Proposed and isolated on `chore/comparex-primary`  
**Decision date:** 2026-11-21

## Decision

Use `pietroconforti-blip/compareX` (Next.js) and its Vercel project `comparex` as the single canonical development base for CompareX.

- GitHub repository: https://github.com/pietroconforti-blip/compareX
- Vercel project: `comparex`
- Current production deployment: https://comparex-kwi5mafpb-compare-x1.vercel.app
- Keep the existing visual design and interaction patterns. This decision is an architecture/consolidation decision, not a redesign.

## What stays

- The current Next.js application and its Vienna/Milan comparison experience.
- The existing search, AI search, package builder, and category catalogue.
- Supabase as the intended managed database platform, subject to verifying migrations and production environment configuration.
- Stripe as the intended billing provider, with test mode first.

## What is not being done

- Do not delete or archive any other Vercel project or repository yet.
- Do not change the production domain or promote a new deployment as part of this decision.
- Do not replace the current authentication implementation without a migration and account-data plan.
- Do not enable live payments, order collection, or Stripe Tax until legal seller, VAT treatment, supplier authorisations, and operational fulfilment are confirmed.
- Do not trust browser-submitted prices; calculate all payment amounts on the server from an authoritative catalogue.

## Selective feature migration from comparex-site

The separate `comparex-site` project has account, saved-package, favourites, and Better Auth work. Treat it as a reference implementation only. Before porting anything, compare the actual user flows and data model. Reuse only features that are demonstrably better, and adapt them to this repository's chosen auth/database architecture. Do not copy its Neon/PGlite database layer or Better Auth setup wholesale into this app.

## Next implementation sequence

1. Verify the canonical Vercel project's Git connection, production environment variables, domain aliases, and latest deployment source.
2. Audit the current Next.js app routes and database migrations; verify which Supabase migrations have actually been applied before changing schema.
3. Stabilise authentication and persistent user data on the canonical stack.
4. Finish Premium subscription billing in Stripe test mode: €4.99 monthly and €39.99 yearly, no free trial; implement verified webhooks and customer self-service portal.
5. Keep the existing design unchanged while testing the full signup, upgrade, cancellation, and account lifecycle.
6. Only after production parity and backups are verified, consider archiving duplicate Vercel projects. Never delete repositories or user data as part of cleanup.

## Safety and release gates

- Test deployments must be reviewed before production promotion.
- Secrets stay in Vercel environment variables and server-only code.
- Supabase service-role keys must never be exposed to the browser.
- Stripe live mode stays disabled until tax/legal and operational launch gates are complete.
- Any database migration must be reviewed, backed up, and verified against the live schema before execution.
