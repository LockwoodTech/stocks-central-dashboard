import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Bell,
  Target,
  Wallet,
  Shield,
  Menu,
  X,
  ArrowRight,
  Star,
  Users,
  Zap,
  ChevronRight,
  Activity,
} from 'lucide-react';
import PricingCards from '@/components/PricingCards';
import { useLivePrices } from '@/hooks/useLivePrices';
import { getPublicMovers, type PublicMoversResponse } from '@/api/livePrices';
import { useQuery } from '@tanstack/react-query';

/* ─── Feature Data ───────────────────────────────────────────────── */

const features = [
  {
    icon: TrendingUp,
    title: 'Live Market Data',
    description: 'Real-time prices for stocks, ETFs, and funds — all in one ticker',
  },
  {
    icon: BarChart3,
    title: 'Portfolio Analytics',
    description: '8 interactive charts across your stock and fund holdings',
  },
  {
    icon: Bell,
    title: 'SMS Price Alerts',
    description: 'Buy SMS credits and get notified when prices hit your targets',
  },
  {
    icon: Target,
    title: 'Financial Goals',
    description: 'Set and track investment goals with progress monitoring',
  },
  {
    icon: Wallet,
    title: 'Fund Tracking',
    description: 'Track iTrust funds alongside your DSE stock portfolio',
  },
  {
    icon: Shield,
    title: 'Trade Verification',
    description: 'WAC calculations and cost breakdowns for every trade',
  },
];

/* ─── Testimonial Data ───────────────────────────────────────────── */

const testimonials = [
  {
    quote:
      'Stocks Central transformed how I manage my investments. The real-time alerts have helped me make better decisions and never miss an opportunity.',
    name: 'Amina Mwalimu',
    role: 'Retail Investor, Dar es Salaam',
    rating: 5,
  },
  {
    quote:
      'I used to track everything in spreadsheets. Now I get portfolio analytics, cost breakdowns, and alerts all in one place. Highly recommended.',
    name: 'Joseph Kimaro',
    role: 'Financial Analyst, Arusha',
    rating: 5,
  },
  {
    quote:
      'The fund tracking feature is fantastic for monitoring my iTrust investments. The interface is clean and easy to use even on mobile.',
    name: 'Grace Massawe',
    role: 'Business Owner, Mwanza',
    rating: 5,
  },
];

/* ─── Stats Data ────────────────────────────────────────────────── */

const stats = [
  { value: '28+', label: 'Listed Stocks', icon: TrendingUp },
  { value: '2,000+', label: 'Active Investors', icon: Users },
  { value: 'Live', label: 'Market Data', icon: Zap },
  { value: '4.8', label: 'User Rating', icon: Star },
];

/* ─── Nav Links ──────────────────────────────────────────────────── */

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
];

/* ─── Landing Page Component ─────────────────────────────────────── */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAnnual, setIsAnnual] = useState(false);
  const { data: livePrices, isLoading: pricesLoading } = useLivePrices();
  const { data: movers, isLoading: moversLoading } = useQuery<PublicMoversResponse>({
    queryKey: ['publicMovers'],
    queryFn: getPublicMovers,
    staleTime: 60_000,
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 antialiased">
      {/* ── Navigation ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
                <TrendingUp className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                Stocks Central
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all shadow-sm"
              >
                Get Started Free
              </Link>
            </div>

            <button
              type="button"
              className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-lg">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) =>
                link.href.startsWith('#') ? (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2.5"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2.5"
                  >
                    {link.label}
                  </Link>
                ),
              )}
              <hr className="border-gray-100" />
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-medium text-gray-600 hover:text-gray-900 py-2.5"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block w-full text-center rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white"
              >
                Get Started Free
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* ── Hero Section ───────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 via-white to-white" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-8">
              <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-medium text-gray-700">
                Live market data from DSE
              </span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
              Your Investments.
              <br />
              <span className="text-gray-400">
                One Dashboard.
              </span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Track DSE stocks, iTrust funds, and ETFs in real-time. Set price
              alerts, analyze your portfolio, and build wealth with Tanzania's
              most complete investment tracker.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 rounded-xl bg-gray-900 px-8 py-3.5 text-base font-semibold text-white hover:bg-gray-800 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-8 py-3.5 text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all"
              >
                Explore Features
              </a>
            </div>

            {/* Trust line */}
            <p className="mt-6 text-xs text-gray-400">
              Free to start. No credit card required.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="mt-16 sm:mt-20 relative mx-auto max-w-5xl">
            {/* Floating badges */}
            <div className="hidden sm:block absolute -left-4 top-12 z-10 animate-float">
              <div className="rounded-xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">CRDB</p>
                    <p className="text-sm font-bold text-emerald-600">+3.2%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="hidden sm:block absolute -right-4 top-28 z-10 animate-float-delayed">
              <div className="rounded-xl bg-white shadow-lg shadow-gray-200/50 border border-gray-100 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-medium">Alert</p>
                    <p className="text-xs font-semibold text-gray-700">NMB hit TZS 14K</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-900 p-[2px] shadow-2xl shadow-black/20">
              <div className="rounded-[14px] bg-gray-900 p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-red-400/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
                  <div className="h-3 w-3 rounded-full bg-green-400/80" />
                  <div className="ml-3 flex-1 rounded-md bg-gray-800 h-6 flex items-center px-3">
                    <span className="text-xs text-gray-500">stocks.co.tz/dashboard</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  <div className="rounded-xl bg-gray-800 p-3 sm:p-4 border border-gray-700/50">
                    <div className="text-[10px] text-gray-500 font-medium mb-1">Portfolio Value</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">TZS 12.4M</div>
                    <div className="text-xs text-emerald-400 font-medium mt-1">+2.4%</div>
                  </div>
                  <div className="rounded-xl bg-gray-800 p-3 sm:p-4 border border-gray-700/50">
                    <div className="text-[10px] text-gray-500 font-medium mb-1">Holdings</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">8 Stocks</div>
                    <div className="text-xs text-gray-500 font-medium mt-1">3 Funds</div>
                  </div>
                  <div className="rounded-xl bg-gray-800 p-3 sm:p-4 border border-gray-700/50">
                    <div className="text-[10px] text-gray-500 font-medium mb-1">Active</div>
                    <div className="text-lg sm:text-2xl font-bold text-white">3 Alerts</div>
                    <div className="text-xs text-amber-400 font-medium mt-1">1 triggered</div>
                  </div>
                </div>
                <div className="mt-4 rounded-xl bg-gray-800 p-4 h-32 sm:h-48 flex items-end justify-between gap-1 border border-gray-700/50">
                  {[40, 55, 35, 70, 50, 80, 65, 90, 75, 85, 60, 95].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm bg-white/20"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -inset-x-20 -bottom-10 h-40 bg-gradient-to-t from-white to-transparent pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Stats Bar ──────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="text-center">
                  <div className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-gray-100 mb-3">
                    <Icon className="h-5 w-5 text-gray-700" />
                  </div>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Live Market Data ─────────────────────────────────── */}
      <section id="market" className="py-16 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-6">
              <Activity className="h-3.5 w-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Live from DSE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Live Market Data
            </h2>
            <p className="mt-4 text-gray-500">
              Real-time stock prices from the Dar es Salaam Stock Exchange
            </p>
          </div>

          {pricesLoading && moversLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
            </div>
          ) : livePrices && livePrices.length > 0 ? (
            /* ── Live Prices Table ── */
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Price (TZS)</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Change</th>
                      <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Change %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {livePrices.slice(0, 10).map((stock, i) => {
                      const isPositive = stock.change > 0;
                      const isNegative = stock.change < 0;
                      return (
                        <tr
                          key={stock.company}
                          className={`border-b border-gray-50 hover:bg-gray-50/50 transition-colors ${
                            i === 9 ? 'border-b-0' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            <span className="text-sm font-semibold text-gray-900">{stock.company}</span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className="text-sm font-mono font-medium text-gray-900">
                              {stock.price.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center gap-1 text-sm font-mono font-medium ${
                                isPositive ? 'text-emerald-600' : isNegative ? 'text-red-500' : 'text-gray-500'
                              }`}
                            >
                              {isPositive ? (
                                <TrendingUp className="h-3.5 w-3.5" />
                              ) : isNegative ? (
                                <TrendingDown className="h-3.5 w-3.5" />
                              ) : null}
                              {isPositive ? '+' : ''}
                              {stock.change.toLocaleString()}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                isPositive
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : isNegative
                                    ? 'bg-red-50 text-red-600'
                                    : 'bg-gray-100 text-gray-600'
                              }`}
                            >
                              {isPositive ? '+' : ''}
                              {stock.changePercent.toFixed(2)}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {livePrices.length > 10 && (
                <div className="border-t border-gray-100 px-4 py-3 text-center bg-gray-50/50">
                  <Link
                    to="/register"
                    className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    Sign up to see all {livePrices.length} stocks →
                  </Link>
                </div>
              )}
            </div>
          ) : movers && (movers.gainers.length > 0 || movers.mostActive.length > 0) ? (
            /* ── Movers Fallback (when live prices are empty) ── */
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Gainers */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                    Top Gainers
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {movers.gainers.slice(0, 5).map((stock) => (
                    <div key={stock.company} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stock.company}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          TZS {stock.closingPrice.toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                        +{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                  {movers.gainers.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">No gainers today</p>
                  )}
                </div>
              </div>

              {/* Losers */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    Top Losers
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {movers.losers.slice(0, 5).map((stock) => (
                    <div key={stock.company} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stock.company}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          TZS {stock.closingPrice.toLocaleString()}
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">
                        {stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  ))}
                  {movers.losers.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">No losers today</p>
                  )}
                </div>
              </div>

              {/* Most Active */}
              <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-gray-700" />
                    Most Active
                  </h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {movers.mostActive.slice(0, 5).map((stock) => (
                    <div key={stock.company} className="flex items-center justify-between px-4 py-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{stock.company}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          TZS {stock.closingPrice.toLocaleString()}
                        </p>
                      </div>
                      <span className="text-xs text-gray-500 font-mono">
                        Vol: {stock.volume.toLocaleString()}
                      </span>
                    </div>
                  ))}
                  {movers.mostActive.length === 0 && (
                    <p className="px-4 py-6 text-sm text-gray-400 text-center">No data available</p>
                  )}
                </div>
              </div>

              <div className="md:col-span-3 text-center pt-2">
                <Link
                  to="/register"
                  className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                >
                  Sign up for full market data and real-time alerts →
                </Link>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-400 text-sm">
              Market data is currently unavailable. Check back during trading hours.
            </div>
          )}
        </div>
      </section>

      {/* ── Features Section ───────────────────────────────────── */}
      <section id="features" className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-6">
              <Zap className="h-3.5 w-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Powerful Features</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Everything you need to invest smarter
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Powerful tools to track stocks, funds, and ETFs — built for
              Tanzanian investors.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group relative rounded-2xl border border-gray-100 bg-white p-6 sm:p-8 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100/80 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-gray-100">
                    <Icon className="h-6 w-6 text-gray-700" />
                  </div>
                  <h3 className="mt-5 text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-gray-900 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    Learn more
                    <ChevronRight className="h-4 w-4 ml-0.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────── */}
      <section className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Start investing in 3 steps
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get up and running in under 2 minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                step: '01',
                title: 'Create your account',
                description: 'Sign up for free with your email. No credit card needed.',
              },
              {
                step: '02',
                title: 'Link your DSE account',
                description: 'Connect your CSD account to auto-import your holdings.',
              },
              {
                step: '03',
                title: 'Track and grow',
                description: 'Set alerts, analyze your portfolio, and hit your investment goals.',
              },
            ].map((item, i) => (
              <div key={item.step} className="relative text-center">
                {i < 2 && (
                  <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-gray-200" />
                )}
                <div className="relative inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gray-900 text-white text-xl font-bold mb-6 shadow-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm text-gray-600 max-w-xs mx-auto">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing Section ────────────────────────────────────── */}
      <section id="pricing" className="py-20 sm:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 border border-gray-200 px-4 py-1.5 mb-6">
              <Star className="h-3.5 w-3.5 text-gray-700" />
              <span className="text-xs font-medium text-gray-700">Pricing</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Choose the plan that fits your investment needs. Upgrade or
              downgrade anytime.
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={isAnnual}
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 ${
                isAnnual ? 'bg-gray-900' : 'bg-gray-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual{' '}
              <span className="text-gray-900 font-semibold">(Save 20%)</span>
            </span>
          </div>

          <PricingCards isAnnual={isAnnual} />
        </div>
      </section>

      {/* ── Testimonials Section ───────────────────────────────── */}
      <section id="testimonials" className="py-20 sm:py-28 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Trusted by Tanzanian investors
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              See what our users are saying about Stocks Central.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl bg-white border border-gray-100 p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow relative"
              >
                {/* Stars */}
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <blockquote>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                </blockquote>
                <div className="mt-6 flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-xs font-semibold text-white">
                      {t.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ────────────────────────────────────────── */}
      <section className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Start tracking your
            <br className="hidden sm:block" />
            {' '}investments today
          </h2>
          <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
            Join thousands of Tanzanian investors using Stocks Central to monitor
            their portfolios and make smarter decisions.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 rounded-xl bg-white px-8 py-3.5 text-base font-semibold text-gray-900 hover:bg-gray-100 transition-all shadow-sm hover:-translate-y-0.5"
            >
              Get Started Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-700 px-8 py-3.5 text-base font-semibold text-gray-300 hover:bg-white/5 hover:border-gray-600 transition-all"
            >
              See Pricing
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="bg-gray-900 border-t border-gray-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white">
                  <TrendingUp className="h-4.5 w-4.5 text-gray-900" />
                </div>
                <span className="text-base font-bold text-white">Stocks Central</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">
                Tanzania's most complete investment tracker. Stocks, funds, and ETFs in one dashboard.
              </p>
            </div>

            {/* Product */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2.5">
                <li><a href="#features" className="text-sm text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="text-sm text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/faq" className="text-sm text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>

            {/* Account */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
                <li><Link to="/register" className="text-sm text-gray-400 hover:text-white transition-colors">Create Account</Link></li>
                <li><Link to="/contact" className="text-sm text-gray-400 hover:text-white transition-colors">Contact Us</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2.5">
                <li><Link to="/terms" className="text-sm text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-sm text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><span className="text-sm text-gray-400">Dar es Salaam, Tanzania</span></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-500">
              &copy; {new Date().getFullYear()} Stocks Central. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Terms</Link>
              <Link to="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">Privacy</Link>
              <span className="text-xs text-gray-600">Built for Tanzanian investors</span>
            </div>
          </div>
        </div>
      </footer>

      {/* ── Animations ─────────────────────────────────────────── */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 5s ease-in-out infinite;
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
}
