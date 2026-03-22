# VibeHome 🏠

> Find your vibe, own your space. Gen Z housing platform combining crowdsourced neighborhood reviews, direct property listings, and fractional co-ownership.

## Features

- **🗺 Vibe Map** — Crowdsourced neighborhood scores (noise, light, WiFi, community) on a Mapbox map
- **🏠 Direct Listings** — Host listings with 2.5% fee vs Airbnb's 15%; hosts save ~€150/mo
- **👥 Co-Pool** — Social dashboard to pool resources and co-own property together

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Mapbox GL |
| Backend | Supabase (Postgres + Auth + RLS), Vercel Edge |
| Payments | Stripe (Connect + Billing + Webhooks) |
| Email | Resend |
| Legal | Documenso (e-sign), Persona (KYC) |
| Analytics | PostHog |

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/your-org/vibehome
cd vibehome
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
# Fill in all values (see below)
```

### 3. Set up Supabase

```bash
# Install Supabase CLI
npm install -g supabase

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 4. Set up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Enable Connect in your Dashboard
3. Create subscription price IDs for Host Pro, Renter Pro, Co-Pool Premium
4. Set up webhook endpoint: `https://your-domain.com/api/webhooks/stripe`
5. Add events: `payment_intent.succeeded`, `customer.subscription.*`, `account.updated`

### 5. Run locally

```bash
npm run dev
```

### 6. Set up Stripe webhook locally

```bash
# In a separate terminal
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Environment Variables

See `.env.local.example` for all required variables.

## Project Structure

```
vibehome/
├── app/
│   ├── (app)/              # Main app pages (map, listings, copool, host)
│   ├── (auth)/             # Login / signup
│   ├── api/                # Route handlers
│   │   ├── bookings/create
│   │   ├── copool/create
│   │   ├── vibes/nearby
│   │   └── webhooks/stripe
│   ├── auth/callback/      # OAuth callback
│   └── join/[code]/        # Viral invite link handler
├── components/
│   ├── ui/                 # Button, Card, VibeScore
│   ├── map/                # Mapbox vibe map
│   ├── listings/           # Property grid + filters
│   ├── copool/             # Pool list + cards
│   ├── host/               # Host dashboard
│   └── shared/             # Nav
├── lib/
│   ├── supabase/           # client, server, admin
│   ├── stripe/             # Stripe client + fee helpers
│   ├── resend/             # Email client
│   └── utils/              # cn(), formatCurrency(), etc.
├── types/                  # TypeScript types
├── supabase/
│   └── migrations/         # SQL migrations
└── middleware.ts            # Auth guard
```

## Monetisation

| Stream | Rate | Notes |
|--------|------|-------|
| Booking fee | 2.5% | vs Airbnb's 15% — hosts save €150/mo |
| Host Pro | €19/mo | Analytics, priority listing, verified badge |
| Renter Pro | €9/mo | Advanced filters, saved searches |
| Co-Pool Premium | €29/pool/mo | Enhanced matching, priority KYC |
| Co-Pool facilitation | 1% of property value | On completed co-ownership deals |

## Deployment

```bash
# Deploy to Vercel
vercel --prod

# Run DB migrations on prod
supabase db push --linked
```

## Legal (Netherlands)

Co-ownership agreements are auto-generated as Maatschap (2–6 owners) or BV with share classes (6+). All co-owners require KYC via Persona. Property transfers require a Dutch notary for the final deed. See `/supabase/migrations/001_initial_schema.sql` for the full data model.

---

Built with ❤️ by the VibeHome team.
