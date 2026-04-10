# Phase 4: Marketing Site, Pricing Tiers, Onboarding, Adaptive UI & Progressive Profiling

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a public marketing site with pricing, user registration with 4-step onboarding profiling, freemium subscription tiers, adaptive UI based on investor profile, and progressive profiling that learns from user behavior.

**Architecture:** Two-layer app — public routes (landing, pricing, login, register) served at root, protected app routes under `/app/*`. Backend extended with Subscription entity, feature-gate middleware, UserActivity tracking, and weekly profile-update cron. Frontend uses Zustand auth store for profile state, React Query for subscription data, and CSS density variables for adaptive layouts.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 (frontend), Node.js + Express 5 + MongoDB + Mongoose (backend), Recharts 3.x, Zustand, React Query, lucide-react icons.

---

## Current State (What's Already Built)

Everything below has been implemented in this session. This plan documents the full architecture for future reference and any remaining integration/polish work.

### Backend (stocks-central-api)

| Component | File | Status |
|-----------|------|--------|
| User entity (investorProfile, subscriptionTier, onboardingComplete) | `src/entities/User.entity.ts` | Done |
| Subscription entity | `src/entities/Subscription.entity.ts` | Done |
| Subscription controller | `src/controllers/subscription.controller.ts` | Done |
| Subscription module (CRUD + tiers) | `src/modules/subscription/api.ts` + `index.ts` | Done |
| Feature gate middleware | `src/services/featureGate.service.ts` | Done |
| Auth extensions (register + profile update) | `src/modules/auth/api.ts` (updateProfile handler) | Done |
| UserActivity entity | `src/entities/UserActivity.entity.ts` | Done |
| UserActivity module | `src/modules/userActivity/api.ts` + `index.ts` | Done |
| Profile update job (weekly cron) | `src/jobs/profileUpdate.job.ts` | Done |
| Routes registered | `src/loaders/router.ts` | Done |

### Frontend (dse-tracker-dashboard)

| Component | File | Status |
|-----------|------|--------|
| Landing page (hero, features, pricing, testimonials, CTA, footer) | `src/pages/landing/index.tsx` (474 lines) | Done |
| PricingCards component (reusable, monthly/annual toggle) | `src/components/PricingCards.tsx` (231 lines) | Done |
| Pricing page | `src/pages/pricing/index.tsx` (43 lines) | Done |
| Registration page (two-panel layout) | `src/pages/register/index.tsx` (236 lines) | Done |
| Onboarding 4-step flow (step cards with progress dots) | `src/pages/onboarding/index.tsx` (257 lines) | Done |
| Route restructuring (public + /app/* protected) | `src/App.tsx` | Done |
| ProtectedRoute (onboarding check) | `src/components/layout/ProtectedRoute.tsx` | Done |
| Sidebar nav updated to /app/* paths | `src/components/layout/Sidebar.tsx` | Done |
| Login page (register link, /app/dashboard redirect) | `src/pages/login/index.tsx` | Done |
| Auth store (investorProfile, subscriptionTier, onboardingComplete) | `src/store/auth.ts` | Done |
| Auth API (register, updateInvestorProfile) | `src/api/auth.ts` | Done |
| Types (InvestorProfile, Subscription, PricingTier, RegisterRequest) | `src/types/index.ts` | Done |
| Subscription API | `src/api/subscription.ts` (22 lines) | Done |
| Subscription hooks | `src/hooks/useSubscription.ts` (35 lines) | Done |
| Feature gate hook | `src/hooks/useFeatureGate.ts` (123 lines) | Done |
| Profile config (Casual/Growth/Active mappings) | `src/utils/profileConfig.ts` (45 lines) | Done |
| Profile config hook | `src/hooks/useProfileConfig.ts` (7 lines) | Done |
| Activity tracking API | `src/api/activity.ts` (13 lines) | Done |
| Activity tracker hook | `src/hooks/useActivityTracker.ts` (98 lines) | Done |
| Density CSS variables | `src/index.css` (density-comfortable/normal/compact) | Done |
| Dashboard links updated to /app/* | `src/pages/dashboard/index.tsx` | Done |
| Watchlist links updated to /app/* | `src/pages/watchlist/index.tsx` | Done |
| Dashboard stocks sorted alphabetically with toggle | `src/pages/dashboard/index.tsx` | Done |

---

## Architecture Overview

### Route Structure

```
Public (no auth required):
  /              -> LandingPage (or redirect to /app/dashboard if logged in)
  /pricing       -> PricingPage
  /login         -> LoginPage
  /register      -> RegisterPage

Protected (no Layout wrapper):
  /onboarding    -> OnboardingPage (skipOnboardingCheck flag)

Protected (Layout wrapper, /app prefix):
  /app/dashboard    -> DashboardPage
  /app/trade        -> TradePage
  /app/watchlist    -> WatchlistPage
  /app/alerts       -> AlertsPage
  /app/portfolio    -> PortfolioPage
  /app/stock/:ticker -> StockDetailPage

Legacy redirects:
  /trade, /watchlist, /alerts, /portfolio -> /app/*
  /landing -> /
```

### Subscription Tiers

| Feature | Free | Basic (2,500/mo) | Pro (8,500/mo) | Premium (12,000/mo) |
|---------|------|-------------------|-----------------|----------------------|
| Stock tx/month | 5 | Unlimited | Unlimited | Unlimited |
| Fund transactions | No | Yes | Yes | Yes |
| Analytics tabs | 2 | 5 | 8 | 8 |
| Goals | 1 | 3 | Unlimited | Unlimited |
| Alerts | 1 | 5 | 15 | Unlimited |
| Cost breakdown | No | Yes | Yes | Yes |
| Minor accounts | No | No | Yes | Yes |
| Export reports | No | No | Yes | Yes |
| Custom brokerage | No | No | Yes | Yes |
| API access | No | No | No | Yes |

Annual pricing: 20% discount (Basic 24,000/yr, Pro 81,600/yr, Premium 115,200/yr).

### Investor Profile Scoring

Onboarding asks 4 questions. Answers are scored and summed:

**Experience:** beginner=0, little=1, experienced=2, professional=3
**Goal:** long-term-growth=0, save-for-something=1, income=2, active-trading=3
**Frequency:** rarely=0, monthly=1, weekly=2, daily=3
**Interest:** goals=0, analytics=1, market-movers=2, trading=3

Score mapping: 0-4 = **Casual**, 5-8 = **Growth**, 9+ = **Active**

### Adaptive UI Per Profile

| Config | Casual | Growth | Active |
|--------|--------|--------|--------|
| Dashboard view | overview (simple) | detailed (charts+movers) | trader (compact, data-dense) |
| Portfolio default tab | stocks | analytics | transactions |
| Analytics tabs visible | 3 | 6 | All 8 |
| Info density | comfortable (large cards) | normal | compact (tight tables) |
| Sidebar order | Dashboard, Portfolio, Watchlist, Alerts, Trade | Dashboard, Portfolio, Watchlist, Trade, Alerts | Dashboard, Trade, Portfolio, Watchlist, Alerts |
| Show cost breakdown | No | Yes | Yes |
| Show order book | No | No | Yes |

### Progressive Profiling

- `useActivityTracker` hook runs in Layout, batches page visits every 60s to `POST /user-activity`
- Backend `profileUpdate.job.ts` runs weekly (Sunday midnight)
- Aggregates 4 weeks of activity, scores behavior
- If behavior maps to different profile for 3+ weeks, auto-updates profileType
- Frontend shows non-intrusive nudge banner when profile mismatch detected

---

## Remaining Integration Tasks

### Task 1: Apply Adaptive UI to Components

The hooks (`useProfileConfig`, `useFeatureGate`) exist but aren't wired into components yet.

**Files to modify:**
- `src/pages/portfolio/PortfolioAnalytics.tsx` — filter visible tabs based on `maxAnalyticsTabs` from profile config
- `src/pages/portfolio/index.tsx` — set default tab from profile config's `portfolioDefaultTab`
- `src/components/layout/Sidebar.tsx` — reorder nav items based on profile config's `sidebarOrder`
- `src/components/layout/Layout.tsx` — apply density class (`density-comfortable`/`density-normal`/`density-compact`) and mount `useActivityTracker`

**Step 1:** In `Sidebar.tsx`, import `useProfileConfig` and sort `navItems` by `config.sidebarOrder`

**Step 2:** In `Layout.tsx`, import `useProfileConfig` and `useActivityTracker`. Add `density-{config.infoDensity}` class to the root div. Call `useActivityTracker()` to start tracking.

**Step 3:** In `portfolio/index.tsx`, import `useProfileConfig` and use `config.portfolioDefaultTab` as the initial tab state.

**Step 4:** In `PortfolioAnalytics.tsx`, accept optional `maxTabs` prop, use `useProfileConfig().maxAnalyticsTabs` as default, filter displayed tabs.

### Task 2: Profile Nudge Banner

**Create:** `src/components/ProfileNudgeBanner.tsx`
- Checks if user's activity-based profile differs from stored profile
- Shows: "Your usage suggests you might prefer the [X] experience. Switch? [Accept] [Dismiss]"
- Accept calls `updateInvestorProfile` API
- Dismiss saves dismissal to localStorage for 2 weeks

**Mount in:** `src/components/layout/Layout.tsx` above the `<Outlet />`

### Task 3: Feature Gate Integration

Wire `useFeatureGate` into components that create resources:
- `StockTransactionModal.tsx` — check `canCreateTransaction()` before allowing submit
- `CreateGoalModal.tsx` — check `canCreateGoal()` before allowing submit
- `AlertsPage` — check `canCreateAlert()` before allowing new alert creation
- Show upgrade prompt modal when limit reached

**Create:** `src/components/UpgradePrompt.tsx`
- Modal showing current tier limits, what they'd get by upgrading
- CTA button linking to `/pricing`

### Task 4: Build Verification

**Step 1:** Run TypeScript check on frontend
```bash
cd dse-tracker-dashboard && npx tsc --noEmit
```

**Step 2:** Run Vite build on frontend
```bash
cd dse-tracker-dashboard && npm run build
```

**Step 3:** Run TypeScript check on backend
```bash
cd stocks-central-api && npx tsc --noEmit
```

Fix any type errors found.

### Task 5: Git Push

Push frontend to remote:
```bash
cd dse-tracker-dashboard
git add -A
git commit -m "Phase 4: marketing site, pricing, onboarding, adaptive UI, progressive profiling"
git remote add lockwood git@github.com:LockwoodTech/des-stock-dashboard.git  # if not already added
git push lockwood main
```

---

## File Reference

### Backend API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | /api/v1/auth/register | No | Create new user account |
| POST | /api/v1/auth/dse-login | No | Login with DSE credentials |
| PUT | /api/v1/auth/profile | Yes | Update investor profile |
| GET | /api/v1/subscription | Yes | Get current subscription |
| POST | /api/v1/subscription | Yes | Create/upgrade subscription |
| POST | /api/v1/subscription/cancel | Yes | Cancel subscription |
| GET | /api/v1/subscription/tiers | No | Get pricing tiers |
| POST | /api/v1/user-activity | Yes | Upsert activity data |
| GET | /api/v1/user-activity | Yes | Get activity history |

### Frontend Hooks

| Hook | File | Purpose |
|------|------|---------|
| `useSubscription()` | `src/hooks/useSubscription.ts` | Current user subscription |
| `usePricingTiers()` | `src/hooks/useSubscription.ts` | Fetch tier definitions |
| `useUpgradeSubscription()` | `src/hooks/useSubscription.ts` | Upgrade mutation |
| `useCancelSubscription()` | `src/hooks/useSubscription.ts` | Cancel mutation |
| `useFeatureGate()` | `src/hooks/useFeatureGate.ts` | Check tier limits |
| `useProfileConfig()` | `src/hooks/useProfileConfig.ts` | Get adaptive UI config |
| `useActivityTracker()` | `src/hooks/useActivityTracker.ts` | Track page visits |

### CSS Density Variables

```css
.density-comfortable  { --card-padding: 1.5rem; --table-cell-py: 0.75rem; --text-base-size: 0.9375rem; }
.density-normal       { --card-padding: 1rem;   --table-cell-py: 0.5rem;  --text-base-size: 0.875rem;  }
.density-compact      { --card-padding: 0.75rem; --table-cell-py: 0.25rem; --text-base-size: 0.8125rem; }
```

Apply via `className={`density-${profileConfig.infoDensity}`}` on Layout root div.
