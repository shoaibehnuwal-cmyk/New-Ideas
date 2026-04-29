# ReputationFlow

**Ethical Online Reputation Management SaaS for Local Businesses**

ReputationFlow helps local businesses (restaurants, salons, dentists, real estate agents, Shopify sellers) manage their online reputation ethically by collecting real customer reviews, responding to reviews using AI, tracking ratings across platforms, and improving customer feedback conversion.

> ⚠️ This platform does NOT support fake reviews, manipulation, or deception. Only ethical review management.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    ReputationFlow                        │
├──────────┬──────────────────┬───────────────────────────┤
│  Web App │   Chrome Ext     │      Backend API          │
│ (Next.js)│  (Manifest V3)   │   (Node/Express)          │
├──────────┴──────────────────┴───────────────────────────┤
│                    AI Layer (OpenAI)                      │
├─────────────────────────────────────────────────────────┤
│              PostgreSQL Database                         │
├─────────────────────────────────────────────────────────┤
│         Stripe Billing  │  Email/SMS (SendGrid/Twilio)  │
└─────────────────────────────────────────────────────────┘
```

## Project Structure

```
reputationflow/
├── web/                    # Next.js frontend (SaaS dashboard)
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   ├── components/    # React components
│   │   ├── lib/           # Utilities, API client
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── styles/        # Global styles
│   └── public/            # Static assets
├── backend/               # Express.js API server
│   └── src/
│       ├── config/        # Database, auth, AI config
│       ├── controllers/   # Route handlers
│       ├── middleware/     # Auth, rate limiting
│       ├── models/        # Database models (Knex)
│       ├── routes/        # API route definitions
│       ├── services/      # Business logic, AI service
│       ├── utils/         # Helpers
│       └── migrations/    # Database migrations
├── chrome-extension/      # Chrome Extension (Manifest V3)
│   ├── popup/             # Extension popup UI
│   ├── content/           # Content scripts
│   ├── background/        # Service worker
│   └── assets/            # Icons, images
└── docs/                  # Documentation
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14, React 18, TailwindCSS, Recharts |
| Backend | Node.js, Express.js, TypeScript |
| Database | PostgreSQL with Knex.js query builder |
| Authentication | JWT + Refresh Tokens, bcrypt |
| AI | OpenAI GPT-4 API (sentiment analysis, reply generation) |
| Payments | Stripe (subscriptions, webhooks) |
| Chrome Extension | Manifest V3, Chrome APIs |
| Email/SMS | SendGrid / Twilio |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Backend Setup

```bash
cd backend
cp .env.example .env
# Edit .env with your configuration
npm install
npm run migrate
npm run dev
```

### Frontend Setup

```bash
cd web
cp .env.example .env.local
# Edit .env.local with your configuration
npm install
npm run dev
```

### Chrome Extension

```bash
cd chrome-extension
# Load as unpacked extension in Chrome
# chrome://extensions → Developer mode → Load unpacked → select chrome-extension/
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/refresh` | Refresh JWT token |
| GET | `/api/reviews` | Get all reviews |
| POST | `/api/reviews/reply` | Generate AI reply |
| POST | `/api/reviews/analyze` | Sentiment analysis |
| POST | `/api/reviews/request` | Send review request |
| GET | `/api/analytics` | Get analytics data |
| POST | `/api/business/connect` | Connect platform |
| GET | `/api/billing/plans` | Get subscription plans |
| POST | `/api/billing/subscribe` | Create subscription |
| POST | `/api/billing/webhook` | Stripe webhook |

## Subscription Tiers

| Plan | Price | Features |
|------|-------|----------|
| Starter | $29/mo | 1 business, 100 AI replies/mo, basic analytics |
| Pro | $99/mo | 5 businesses, 500 AI replies/mo, full analytics, SMS |
| Agency | $299/mo | Unlimited businesses, unlimited AI replies, white-label, API access |

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions for:
- Vercel (Frontend)
- Railway / AWS (Backend)
- Supabase / AWS RDS (Database)

## License

MIT
