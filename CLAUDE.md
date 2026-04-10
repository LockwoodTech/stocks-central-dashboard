# Stocks Central Dashboard

## Project Overview
React 18 + Vite + TypeScript frontend for **Stocks Central** (stocks.co.tz) — Tanzania's investment tracker for Stocks, ETFs, and Funds. Connects to `stocks-central-api` backend at `/api/v1/`.

## Tech Stack
- **Framework**: React 18 + TypeScript
- **Build**: Vite with `@tailwindcss/vite` plugin
- **Styling**: Tailwind CSS v4 (uses `@theme` directive in `src/index.css`)
- **State**: Zustand (auth store with persist), React Query (server state)
- **Routing**: React Router v6
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP**: Axios (`src/api/client.ts` with auth interceptor)

## Design System — Black & White Theme

This app uses a **minimal black and white** design language inspired by modern fintech dashboards. All color is functional (gain/loss indicators, status badges) — the base UI is grayscale.

### Color Tokens (HSL via CSS custom properties)
```
--background:    0 0% 96%     /* Light gray page background */
--foreground:    0 0% 10%     /* Near-black text */
--card:          0 0% 100%    /* White card surfaces */
--card-border:   0 0% 92%     /* Subtle card borders */
--border:        0 0% 90%     /* Default borders */
--muted:         0 0% 96%     /* Muted backgrounds */
--muted-foreground: 0 0% 45% /* Secondary text */
--primary:       220 13% 18%  /* Dark navy/charcoal — buttons, sidebar active */
--primary-foreground: 0 0% 98% /* White text on primary */
--sidebar:       0 0% 100%    /* White sidebar */
--sidebar-foreground: 0 0% 10%
--sidebar-border: 0 0% 92%
```

### Functional Colors (ONLY for data — never for decoration)
- **Gain/positive**: `emerald-500` (#10b981) — green for price increases, profits
- **Loss/negative**: `red-500` (#ef4444) — red for price drops, losses
- **Amber**: `amber-400` (#fbbf24) — watchlist stars, warnings, ratings

### Typography
- **Font**: Inter + General Sans (loaded from Google Fonts / Fontshare)
- **Mono**: JetBrains Mono (for numbers in tables)
- **Headings**: Bold, `text-foreground` (near-black)
- **Body**: Regular, `text-muted-foreground` for secondary info

### UI Patterns
- **Cards**: White (`bg-card`) with 1px `border-card-border`, rounded corners (`rounded-xl`)
- **Buttons**: Primary = dark charcoal (`bg-primary text-primary-foreground`), rounded-lg
- **Sidebar**: White background, icon-only nav with text labels, active item has dark background
- **Tables**: Clean with subtle `border-b border-border` row dividers, no heavy styling
- **Badges**: Minimal, rounded-full, gain/loss variants only
- **Charts**: Single-color line charts (emerald for gains, use dark stroke for neutral)
- **Inputs**: White background, `border-input`, rounded-lg, subtle focus ring

### Stock Logos
Logos are downloaded from DSE CDN and served locally via backend at `/logos/{SYMBOL}.jpg`.
Backend cron job runs daily to sync logos from `https://dse.co.tz/storage/securities/{SYMBOL}/Logo/{SYMBOL}.jpg`.
Fallback: Show 2-letter symbol in a rounded square with `bg-muted text-foreground` styling.

### Dark Mode
- Toggle via Sun/Moon icon in sidebar (desktop) or header (mobile)
- Theme persisted in localStorage via `useThemeStore` (Zustand)
- `.dark` class on `<html>` activates dark CSS variables
- All components use semantic color tokens (not hardcoded grays)

### Key Design Rules
1. **No decorative color** — the UI is black, white, and gray. Only gain/loss/status uses color.
2. **Generous whitespace** — cards have `p-5` or `p-6` padding, sections have `space-y-6`
3. **Flat design** — minimal shadows (`shadow-sm` only on hover), no gradients except subtle chart fills
4. **Data-dense** — portfolio cards show shares, price, bid/ask, volume in a compact layout
5. **Responsive** — sidebar collapses to bottom tab bar on mobile (`md:` breakpoint)
6. **Use semantic tokens** — `text-foreground`, `bg-card`, `border-border` — never hardcode gray values
7. **Landing page follows B&W** — the landing/marketing page uses the same grayscale token system. No indigo, violet, purple, or colored gradients. CTA buttons use `bg-primary`.
8. **No gradient backgrounds** — use solid grayscale backgrounds. The only acceptable gradient is subtle `from-gray-50 to-white` for section transitions.
9. **Functional color only** — amber for stars/ratings, emerald for gains, red for losses. Everything else is grayscale.

## Project Structure
```
src/
  api/          # Axios API functions (alerts, auth, favorites, portfolio, stocks, transactions)
  components/   # Reusable UI components (Button, Card, Badge, Modal, Input, Layout)
  hooks/        # React Query hooks (useAlerts, usePortfolio, useStocks, useTransactions)
  pages/        # Route pages (dashboard, login, portfolio, trade, watchlist, alerts, stock-detail)
  store/        # Zustand stores (auth, theme)
  types/        # TypeScript interfaces
  utils/        # Format utilities (currency, percent, date, volume)
```

## API Conventions
- All API responses are wrapped: `{ success, code, message, data }`
- Extract data with `response.data.data`
- Auth token stored in localStorage (`dse-auth`) via Zustand persist
- Theme stored in localStorage (`dse-theme`) via Zustand persist
- DSE features gated by `useAuthStore.dseLinked` flag

## Transaction & WAC System
- `POST /api/v1/transactions` — log buy/sell trades (source: dse/broker/manual)
- `GET /api/v1/transactions/wac/:symbol` — get WAC and realised gains for a stock
- `GET /api/v1/transactions/verify/:symbol` — compare DSE vs broker vs manual trades
- `GET /api/v1/transactions/realised-gains` — total realised gains summary
- WAC formula: `(existing_shares * existing_WAC + new_shares * buy_price + brokerage) / total_shares`
- Realised gain on sell: `(sell_price - WAC) * shares_sold - brokerage`

## Dev Server
```bash
npm run dev  # Vite on port 3000, proxies /api to localhost:6061
```
