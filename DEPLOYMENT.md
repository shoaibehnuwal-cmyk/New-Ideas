# ReputationFlow Deployment Guide

## Architecture

```
User Browser → Vercel (Next.js) → Railway/AWS (API) → PostgreSQL (DB)
                                      ↕
                              OpenAI API | Stripe | SendGrid/Twilio
```

---

## 1. Database (PostgreSQL)

### Option A: Supabase (Recommended for quick start)
1. Create account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database → Connection string
4. Copy the connection string for your `DATABASE_URL`

### Option B: AWS RDS
```bash
aws rds create-db-instance \
  --db-instance-identifier reputationflow-db \
  --db-instance-class db.t3.micro \
  --engine postgres \
  --engine-version 14 \
  --master-username postgres \
  --master-user-password YOUR_PASSWORD \
  --allocated-storage 20
```

### Option C: Railway
1. Create account at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy the connection URL

### Run Migrations
```bash
cd backend
DATABASE_URL=your_connection_string npm run migrate
```

---

## 2. Backend API

### Option A: Railway (Recommended)

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Deploy:
```bash
cd backend
railway up
```
5. Set environment variables in Railway dashboard:
   - `DATABASE_URL`
   - `JWT_SECRET` (generate: `openssl rand -hex 32`)
   - `JWT_REFRESH_SECRET` (generate: `openssl rand -hex 32`)
   - `OPENAI_API_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `FRONTEND_URL` (your Vercel URL)

### Option B: AWS (ECS/Fargate)

1. Create ECR repository:
```bash
aws ecr create-repository --repository-name reputationflow-api
```

2. Create Dockerfile in `backend/`:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 4000
CMD ["node", "dist/server.js"]
```

3. Build and push:
```bash
cd backend
npm run build
docker build -t reputationflow-api .
docker tag reputationflow-api:latest YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/reputationflow-api:latest
docker push YOUR_ACCOUNT.dkr.ecr.REGION.amazonaws.com/reputationflow-api:latest
```

4. Create ECS service with Fargate

### Option C: Fly.io
```bash
cd backend
fly launch
fly secrets set DATABASE_URL=... JWT_SECRET=... OPENAI_API_KEY=...
fly deploy
```

---

## 3. Frontend (Vercel)

1. Push to GitHub
2. Connect repo to [vercel.com](https://vercel.com)
3. Set root directory to `web`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` = your backend URL (e.g., `https://api.reputationflow.com/api`)
5. Deploy

**Custom Domain:**
```
Settings → Domains → Add domain → Update DNS records
```

---

## 4. Chrome Extension

### Development
1. Open `chrome://extensions/`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select the `chrome-extension/` folder

### Production (Chrome Web Store)
1. Create a ZIP of the `chrome-extension/` folder
2. Go to [Chrome Developer Dashboard](https://chrome.google.com/webstore/devconsole)
3. Pay one-time $5 registration fee
4. Upload the ZIP
5. Fill in listing details
6. Submit for review

### Update API URL
Before publishing, update `API_BASE_URL` in `background/service-worker.js` to your production backend URL.

---

## 5. Third-Party Services

### OpenAI
1. Sign up at [platform.openai.com](https://platform.openai.com)
2. Generate API key
3. Add billing (pay-per-use)
4. Set `OPENAI_API_KEY` in backend environment

### Stripe
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard → Developers
3. Create products and prices:
   - Starter: $29/month
   - Pro: $99/month
   - Agency: $299/month
4. Set up webhook endpoint: `https://your-api.com/api/billing/webhook`
5. Set environment variables:
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - `STRIPE_STARTER_PRICE_ID`
   - `STRIPE_PRO_PRICE_ID`
   - `STRIPE_AGENCY_PRICE_ID`

### SendGrid (Email)
1. Sign up at [sendgrid.com](https://sendgrid.com)
2. Create API key
3. Verify sender domain
4. Set `SENDGRID_API_KEY` and `FROM_EMAIL`

### Twilio (SMS)
1. Sign up at [twilio.com](https://twilio.com)
2. Get Account SID, Auth Token, and phone number
3. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`

---

## 6. Environment Variables Summary

### Backend
| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 4000) |
| `NODE_ENV` | No | Environment (default: development) |
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | JWT signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token secret |
| `OPENAI_API_KEY` | Yes | OpenAI API key |
| `STRIPE_SECRET_KEY` | No | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | No | Stripe webhook secret |
| `FRONTEND_URL` | Yes | Frontend URL for CORS |
| `SENDGRID_API_KEY` | No | SendGrid API key |
| `TWILIO_ACCOUNT_SID` | No | Twilio Account SID |
| `TWILIO_AUTH_TOKEN` | No | Twilio Auth Token |

### Frontend
| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Yes | Backend API URL |

---

## 7. Production Checklist

- [ ] Set strong JWT secrets (min 32 bytes)
- [ ] Enable SSL/TLS on all services
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring (Sentry, Datadog)
- [ ] Configure CORS for production domains only
- [ ] Set up CI/CD pipeline
- [ ] Test Stripe webhook integration
- [ ] Verify email deliverability
- [ ] Set up logging and alerting
- [ ] Review security headers
- [ ] Enable database connection pooling

---

## Scaling Considerations

### Backend
- Use PM2 or similar for process management
- Implement Redis caching for frequently accessed data
- Use message queues (Bull/BullMQ) for background jobs (email/SMS sending, AI processing)
- Consider microservices architecture for AI processing

### Database
- Add read replicas for analytics queries
- Implement connection pooling (PgBouncer)
- Set up automated backups and point-in-time recovery
- Add proper indexing for query optimization

### Frontend
- Vercel handles CDN and edge caching automatically
- Implement client-side caching with SWR or React Query
- Use image optimization (Next.js Image component)
