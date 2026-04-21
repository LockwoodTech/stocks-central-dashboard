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
import { useCompanies, useMarketData, useMarketMovers } from '@/hooks/useStocks';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/useAlerts';
import { formatCurrency } from '@/utils/format';
import { getLogoUrl, handleLogoError } from '@/utils/logo';
import { useIsMobile } from '@/hooks/useIsMobile';

const TIME_RANGES = [
  { label: '1W', days: 7 },
  { label: '1M', days: 30 },
  { label: '3M', days: 90 },
  { label: '1Y', days: 365 },
  { label: '2Y', days: 730 },
];

export default function DashboardPage() {
  const { data: companies, isLoading: companiesLoading } = useCompanies();
  const { data: favorites } = useFavorites();
  const { data: movers } = useMarketMovers();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState('');
  const [chartDays, setChartDays] = useState(30);
  const [sortAsc, setSortAsc] = useState(true);

  // Chart stock: selected or first company
  const chartCompany = useMemo(() => {
    if (selectedStock) return companies?.find((c) => c.company === selectedStock);
    return companies?.[0];
  }, [companies, selectedStock]);

  // Real market data for the selected stock
  const { data: marketData } = useMarketData(chartCompany?.company_id ?? '', chartDays);

  // Chart data sorted chronologically (old → new)
  const chartData = useMemo(() => {
    if (!marketData || marketData.length === 0) return [];
    return [...marketData]
      .sort((a, b) => new Date(a.trade_date).getTime() - new Date(b.trade_date).getTime())
      .map((d) => {
        const date = new Date(d.trade_date);
        const label = chartDays > 90
          ? date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
          : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: label, price: d.closing_price };
      });
  }, [marketData, chartDays]);

  // Filter and sort companies alphabetically
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    const sorted = [...companies].sort((a, b) =>
      sortAsc ? a.company.localeCompare(b.company) : b.company.localeCompare(a.company),
    );
    if (!searchQuery) return sorted;
    const q = searchQuery.toLowerCase();
    return sorted.filter(
      (c) => c.company.toLowerCase().includes(q) || c.fullName.toLowerCase().includes(q),
    );
  }, [companies, searchQuery, sortAsc]);

  const favoriteSymbols = useMemo(
    () => new Set(favorites?.map((f) => f.company) ?? []),
    [favorites],
  );

  const handleToggleFavorite = (symbol: string) => {
    if (favoriteSymbols.has(symbol)) {
      const fav = favorites?.find((f) => f.company === symbol);
      if (fav) removeFavorite.mutate(fav._id);
    } else {
      addFavorite.mutate(symbol);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome back. Here is your market overview.</p>
      </div>

      {/* Movers / Gainers / Losers */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {/* Gainers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Gainers</CardTitle>
            <TrendingUp className="h-4 w-4 text-gain" />
          </CardHeader>
          <div className="space-y-2">
            {movers?.gainers?.length ? (
              movers.gainers.slice(0, isMobile ? 3 : undefined).map((m) => (
                <Link
                  key={m.company}
                  to={`/app/stock/${m.company}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getLogoUrl(m.company)}
                      alt={m.company}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={handleLogoError}
                    />
                    <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                      {m.company.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.company}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(m.closingPrice)}</p>
                    </div>
                  </div>
                  <Badge variant="gain">+{m.changePercent.toFixed(1)}%</Badge>
                </Link>
              ))
            ) : (
              <p className="py-2 text-center text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </Card>

        {/* Losers */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Top Losers</CardTitle>
            <TrendingDown className="h-4 w-4 text-loss" />
          </CardHeader>
          <div className="space-y-2">
            {movers?.losers?.length ? (
              movers.losers.slice(0, isMobile ? 3 : undefined).map((m) => (
                <Link
                  key={m.company}
                  to={`/app/stock/${m.company}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getLogoUrl(m.company)}
                      alt={m.company}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={handleLogoError}
                    />
                    <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                      {m.company.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.company}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(m.closingPrice)}</p>
                    </div>
                  </div>
                  <Badge variant="loss">{m.changePercent.toFixed(1)}%</Badge>
                </Link>
              ))
            ) : (
              <p className="py-2 text-center text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </Card>

        {/* Most Active */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Most Active</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <div className="space-y-2">
            {movers?.mostActive?.length ? (
              movers.mostActive.slice(0, isMobile ? 3 : undefined).map((m) => (
                <Link
                  key={m.company}
                  to={`/app/stock/${m.company}`}
                  className="flex items-center justify-between rounded-lg px-2 py-1.5 hover:bg-muted"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getLogoUrl(m.company)}
                      alt={m.company}
                      className="h-6 w-6 rounded-full object-cover"
                      onError={handleLogoError}
                    />
                    <div className="hidden h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-foreground">
                      {m.company.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{m.company}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(m.closingPrice)}</p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{m.volume.toLocaleString()} vol</span>
                </Link>
              ))
            ) : (
              <p className="py-2 text-center text-xs text-muted-foreground">No data</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Stock Chart with Selector */}
        <div className="xl:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <select
                  value={selectedStock || chartCompany?.company || ''}
                  onChange={(e) => setSelectedStock(e.target.value)}
                  className="max-w-[180px] md:max-w-none truncate rounded-lg border border-card-border bg-muted px-3 py-2.5 md:py-1.5 text-sm font-semibold text-foreground focus:border-primary focus:outline-none"
                >
                  {companies?.map((c) => (
                    <option key={c._id || c.id || c.company} value={c.company}>
                      {isMobile ? c.company : `${c.company} — ${c.fullName}`}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-1">
                {TIME_RANGES.map((range) => (
                  <button
                    key={range.label}
                    onClick={() => setChartDays(range.days)}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      chartDays === range.days
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground hover:bg-border'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </CardHeader>
            <div className="h-64">
              {chartData.length > 0 ? (
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
                        background: 'hsl(var(--color-card))',
                        border: '1px solid hsl(var(--color-card-border))',
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
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Select a stock to view price chart
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Watchlist Sidebar */}
        <Card>
          <CardHeader>
            <CardTitle>My Watchlist</CardTitle>
            <Link to="/app/watchlist" className="text-sm text-primary hover:underline">
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
                    className="flex items-center justify-between rounded-lg px-2 py-2 hover:bg-muted"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{fav.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {company?.fullName ?? 'Loading...'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search stocks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-card-border bg-muted py-2.5 md:py-1.5 pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
            />
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="pb-3 pl-2 font-medium text-muted-foreground">
                  <button
                    onClick={() => setSortAsc((v) => !v)}
                    className="flex items-center gap-1 hover:text-foreground transition-colors"
                  >
                    Stock {sortAsc ? '↑' : '↓'}
                  </button>
                </th>
                <th className="pb-3 font-medium text-muted-foreground">Sector</th>
                <th className="pb-3 text-right font-medium text-muted-foreground">Country</th>
                <th className="pb-3 pr-2 text-right font-medium text-muted-foreground">Watchlist</th>
              </tr>
            </thead>
            <tbody>
              {companiesLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-3 pl-2">
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </td>
                    <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
                    <td className="py-3"><div className="h-4 w-8 animate-pulse rounded bg-muted" /></td>
                  </tr>
                ))
              ) : filteredCompanies.length > 0 ? (
                filteredCompanies.map((c) => (
                  <tr key={c._id || c.id || c.company} className="border-b border-border/50 hover:bg-muted/50">
                    <td className="py-3 pl-2">
                      <Link to={`/app/stock/${c.company}`} className="group flex items-center gap-3">
                        <img
                          src={getLogoUrl(c.company, c.logo)}
                          alt={c.company}
                          className="h-8 w-8 rounded-lg object-cover"
                          onError={handleLogoError}
                        />
                        <div
                          className="hidden h-8 w-8 items-center justify-center rounded-lg bg-muted text-xs font-bold text-foreground"
                        >
                          {c.company.slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground group-hover:text-primary">
                            {c.company}
                          </p>
                          <p className="text-xs text-muted-foreground">{c.fullName}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="py-3 text-muted-foreground">{c.marketSegment ?? '--'}</td>
                    <td className="py-3 text-right text-muted-foreground">{c.country}</td>
                    <td className="py-3 pr-2 text-right">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          handleToggleFavorite(c.company);
                        }}
                        className="ml-auto rounded-full p-1 transition-colors hover:bg-muted"
                      >
                        {favoriteSymbols.has(c.company) ? (
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        ) : (
                          <Star className="h-4 w-4 text-muted-foreground hover:text-amber-400" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
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
