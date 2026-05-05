# Testing ReputationFlow

## Overview
ReputationFlow is a Next.js 14 + Express/TypeScript SaaS app with PostgreSQL. Testing involves running both frontend and backend servers locally and exercising features via the browser UI.

## Devin Secrets Needed
None required for local testing. The app uses a local PostgreSQL database.

## Infrastructure Setup

### Start PostgreSQL
```bash
sudo service postgresql start
# Verify:
pg_isready -h localhost
```

### Start Backend (port 4000)
```bash
cd /home/ubuntu/repos/New-Ideas/backend
npx ts-node src/server.ts
```

### Start Frontend (port 3000)
```bash
cd /home/ubuntu/repos/New-Ideas/web
npm run dev
```

### Clean Database for Fresh Testing
```bash
PGPASSWORD=reputationflow123 psql -U reputationflow -d reputationflow_db -h localhost -c "DELETE FROM reviews; DELETE FROM businesses;"
```

## Test Account
- Email: `demo@reputationflow.com`
- Password: `DemoPass123!`

## Key Test Flows

### Review Management (Reviews Page)
1. **Empty State**: Fresh account shows "No reviews yet" — no hardcoded demo data
2. **Add Review**: Click "+ Add Review" button, fill modal (name, platform, rating stars, text), submit
3. **Sentiment Classification**: Rating is the primary signal:
   - Rating ≤ 2 → "Negative"
   - Rating ≥ 4 → "Positive"
   - Rating 3 → Falls back to keyword analysis of review text
4. **Filter Reviews**: Click sentiment filter buttons (All/Positive/Neutral/Negative) to filter
5. **Delete Review**: Click trash icon on review card — removes from DB immediately
6. **AI Reply**: Click "Reply with AI" link — generates template response with Send Reply/Regenerate/Cancel buttons

### Dashboard
- Shows real-time stats from PostgreSQL (Total Reviews, Avg Rating, Businesses)
- Sentiment Breakdown pie chart and Reviews by Platform bar chart
- Stats update immediately when reviews are added/deleted (navigate away and back)

## Common Gotchas

### React Strict Mode Double-Mount
React 18 strict mode runs useEffect twice in dev. The Reviews page handles this with a `cancelled` flag cleanup function. If you see "Failed to create business" errors, this might be a race condition — the retry logic should handle it automatically.

### Sentiment Misclassification
The fallback AI (no OpenAI key) uses rating as the primary signal. If sentiment seems wrong, check that the rating is being passed through to `analyzeSentiment()` in `backend/src/controllers/reviewController.ts`.

### Auto-Created Business
The first visit to the Reviews page auto-creates a business named "My Business" if the user has none. This is expected behavior — don't clean businesses mid-test or the next Reviews page visit will create a new one.

### Server Restarts
After system restarts, all three services (PostgreSQL, backend, frontend) need manual restart. Database data persists across restarts.

## Build Checks
```bash
# Backend type check
cd /home/ubuntu/repos/New-Ideas/backend && npx tsc --noEmit

# Frontend build
cd /home/ubuntu/repos/New-Ideas/web && npx next build
```
