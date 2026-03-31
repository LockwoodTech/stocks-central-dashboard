import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Star,
  Search,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import { useDseHoldings } from '@/hooks/usePortfolio';
import { useCompanies } from '@/hooks/useStocks';
import { useFavorites } from '@/hooks/useAlerts';
import { formatCurrency, formatPercent } from '@/utils/format';

// Generate a mini sparkline data set from a seed value
function generateSparkline(base: number, points = 20): { v: number }[] {
  const data: { v: number }[] = [];
  let val = base;
  for (let i = 0; i < points; i++) {
    val += (Math.random() - 0.48) * base * 0.02;
    data.push({ v: Math.round(val) });
  }
  return data;
}

export default function DashboardPage() {
  const { data: holdings, isLoading: holdingsLoading } = useDseHoldings();
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: favorites } = useFavorites();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<string | null>(null);

  // Featured stock: first holding or first company
  const featuredTicker = selectedStock || holdings?.[0]?.company?.symbol || companies?.[0]?.company;
  const featuredCompany = companies?.find((c) => c.company === featuredTicker);

  // Chart data for the featured stock (mock for now, replaced when market-data endpoint is used)
  const chartData = useMemo(() => {
    const base = 2000;
    return Array.from({ length: 30 }, (_, i) => ({
      date: `Day ${i + 1}`,
      price: base + Math.sin(i / 3) * 200 + Math.random() * 100,
    }));
  }, []);

  // Filter companies by search
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    if (!searchQuery) return companies;
    const q = searchQuery.toLowerCase();
    return companies.filter(
      (c) =>
        c.company.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q),
    );
  }, [companies, searchQuery]);

  const favoriteSymbols = useMemo(
    () => new Set(favorites?.map((f) => f.company) ?? []),
    [favorites],
  );

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back. Here is your market overview.</p>
      </div>

      {/* My Portfolio - Horizontal Cards */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">My Portfolio</h2>
          <Link to="/portfolio" className="flex items-center gap-1 text-sm text-primary hover:underline">
            View all <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2">
          {holdingsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-32 w-56 shrink-0 animate-pulse rounded-xl bg-gray-200" />
            ))
          ) : holdings && holdings.length > 0 ? (
            holdings.slice(0, 8).map((h) => {
              const sparkData = generateSparkline(h.currentPrice);
              const isGain = h.gainLossPercent >= 0;
              return (
                <Link
                  key={h.company.symbol}
                  to={`/stock/${h.company.symbol}`}
                  onClick={() => setSelectedStock(h.company.symbol)}
                  className="group flex w-56 shrink-0 flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{h.company.symbol}</p>
                      <p className="text-xs text-gray-500">{h.shares} shares</p>
                    </div>
                    <Badge variant={isGain ? 'gain' : 'loss'}>
                      {isGain ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {formatPercent(h.gainLossPercent)}
                    </Badge>
                  </div>
                  <div className="my-2 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sparkData}>
                        <defs>
                          <linearGradient id={`grad-${h.company.symbol}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={isGain ? '#22c55e' : '#ef4444'} stopOpacity={0.3} />
                            <stop offset="100%" stopColor={isGain ? '#22c55e' : '#ef4444'} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="v"
                          stroke={isGain ? '#22c55e' : '#ef4444'}
                          fill={`url(#grad-${h.company.symbol})`}
                          strokeWidth={1.5}
                          dot={false}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(h.currentPrice)}
                  </p>
                </Link>
              );
            })
          ) : (
            <Card className="w-full text-center text-sm text-gray-500">
              <p>No DSE holdings found. Link your DSE account to see your portfolio.</p>
            </Card>
          )}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Featured Stock Chart */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div>
                <CardTitle>{featuredTicker ?? 'Market'} Price Chart</CardTitle>
                <p className="text-xs text-gray-500">{featuredCompany?.fullName ?? 'Select a stock to view chart'}</p>
              </div>
              <Badge variant="info">30 Days</Badge>
            </CardHeader>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2563eb" stopOpacity={0.2} />
                      <stop offset="100%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip
                    contentStyle={{
                      background: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="price"
                    stroke="#2563eb"
                    fill="url(#chartGradient)"
                    strokeWidth={2}
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Watchlist Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>My Watchlist</CardTitle>
            <Link to="/watchlist" className="text-sm text-primary hover:underline">
              View all
            </Link>
          </CardHeader>
          <div className="space-y-3">
            {favorites && favorites.length > 0 ? (
              favorites.slice(0, 6).map((fav) => {
                const company = companies?.find((c) => c.company === fav.company);
                return (
                  <Link
                    key={fav._id}
                    to={`/stock/${fav.company}`}
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{fav.company}</p>
                        <p className="text-xs text-gray-500">
                          {company?.fullName ?? 'Loading...'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </Link>
                );
              })
            ) : (
              <p className="py-4 text-center text-sm text-gray-500">
                No stocks in your watchlist yet.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* All Stocks Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Stocks</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-gray-400 focus:border-primary focus:outline-none"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-3 pl-2 font-medium text-gray-500">Stock</th>
                <th className="pb-3 font-medium text-gray-500">Sector</th>
                <th className="pb-3 text-right font-medium text-gray-500">Country</th>
                <th className="pb-3 pr-2 text-right font-medium text-gray-500">Watchlist</th>
              </tr>
            </thead>
            <tbody>
              {companiesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="py-3 pl-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                    </td>
                    <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
                    <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
                    <td className="py-3"><div className="h-4 w-8 animate-pulse rounded bg-gray-200" /></td>
                  </tr>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((c) => (
                  <tr key={c._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3 pl-2">
                      <Link to={`/stock/${c.company}`} className="group flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold text-gray-700">
                          {c.company.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 group-hover:text-primary">
                            {c.company}
                          </p>
                          <p className="text-xs text-gray-500">{c.fullName}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 text-gray-600">{c.marketSegment ?? '--'}</td>
                    <td className="py-3 text-right text-gray-600">{c.country}</td>
                    <td className="py-3 pr-2 text-right">
                      {favoriteSymbols.has(c.company) ? (
                        <Star className="ml-auto h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <Star className="ml-auto h-4 w-4 text-gray-300" />
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">
                    No stocks found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
