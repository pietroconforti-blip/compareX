# CompareX

**Compare better. Choose better.**

CompareX is a student-focused comparison platform for Austria and Italy. Students can find and compare housing, mobile plans, transport, gyms, and streaming offers — then build affordable monthly packages with AI assistance.

Live demo: [compare-x on Vercel](https://compare-x.vercel.app) (or check your latest deployment)

## Features

- **AI Search** — Natural language queries ("student room under €500 in Vienna with cheap mobile")
- **Package Builder** — Combine services and see estimated monthly totals
- **Categories** — Housing, Mobile, Transport, Gym, Streaming
- **Student-focused data** — Real offers for Vienna, Milan, and more
- **Checkout** — Stripe-powered ordering flow
- **Dashboard & Marketplace** — Student tools and peer listings
- **Moving guide & Contact** — Practical help for international students

## Tech Stack

- **Next.js 16** (App Router)
- **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Supabase** (backend / auth / data)
- **Stripe** (payments)

## Getting Started

```bash
git clone https://github.com/pietroconforti-blip/compareX.git
cd compareX
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment Variables

Create a `.env.local` file with your Supabase and Stripe keys (see `.env.example` if present, or the docs in `/docs`).

## Project Structure

```
app/
  api/          # Route handlers (AI search, housing, checkout, Stripe, etc.)
  checkout/     # Checkout flow
  dashboard/    # Student dashboard
  search/       # Search results
  package-builder/
  ...
lib/            # Shared data, scoring, Supabase client, supplier adapters
docs/           # Integration roadmaps and outreach templates
```

## Contributing

Pull requests are welcome. For major changes, open an issue first.

## License

Private / All rights reserved (unless otherwise stated).
