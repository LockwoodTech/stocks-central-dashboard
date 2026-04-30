import { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Activity,
  GitCompare,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useCompanies, useOrderBook, useMarketData, useLivePrices } from '@/hooks/useStocks';
import { useDseHoldingBySymbol, useDseOrdersBySymbol } from '@/hooks/usePortfolio';
import { useFavorites, useAddFavorite, useRemoveFavorite } from '@/hooks/useAlerts';
import {
  formatCurrency,
  formatPercent,
  formatVolume,
  formatNumber,
  formatDate,
} from '@/utils/format';

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Peer Comparison helper                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

interface PeerRow {
  symbol: string;
  fullName: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
}

function PeerComparisonCard({
  currentSymbol,
  currentSector,
}: {
  currentSymbol: string;
  currentSector: string | undefined;
}) {
  const { data: companies } = useCompanies();
  const { data: livePrices } = useLivePrices();

  const peers = useMemo<PeerRow[]>(() => {
    if (!companies || !livePrices) return [];

    const priceMap = new Map<
      string,
      { price: number; change: number; changePercent: number }
    >();
    livePrices.forEach((lp) => {
      priceMap.set(lp.company, {
        price: lp.price,
        change: lp.change,
        changePercent: lp.changePercent,
      });
    });

    // Build candidates: same sector first, excluding current symbol
    const sameSector = companies.filter(
      (c) =>
        c.company !== currentSymbol &&
        currentSector &&
        c.marketSegment === currentSector,
    );

    const others = companies.filter(
      (c) => c.company !== currentSymbol && c.marketSegment !== currentSector,
    );

    // Prefer up to 4 from same sector, fill remainder from others
    const candidates = [...sameSector, ...others].slice(0, 4);

    return candidates.map((c) => {
      const lp = priceMap.get(c.company);
      return {
        symbol: c.company,
        fullName: c.fullName,
        price: lp?.price ?? 0,
        change: lp?.change ?? 0,
        changePercent: lp?.changePercent ?? 0,
        volume: 0,
      };
    });
  }, [companies, livePrices, currentSymbol, currentSector]);

  // Also include the current stock for comparison
  const currentLive = livePrices?.find((lp) => lp.company === currentSymbol);
  const currentCompany = companies?.find((c) => c.company === currentSymbol);

  const allRows: PeerRow[] = useMemo(() => {
    if (!currentCompany) return peers;
    const currentRow: PeerRow = {
      symbol: currentSymbol,
      fullName: currentCompany.fullName,
      price: currentLive?.price ?? 0,
      change: currentLive?.change ?? 0,
      changePercent: currentLive?.changePercent ?? 0,
      volume: 0,
    };
    return [currentRow, ...peers];
  }, [currentCompany, currentSymbol, currentLive, peers]);

  if (allRows.length <= 1) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitCompare className="h-4 w-4 text-muted-foreground" />
          <CardTitle>Compare with Peers</CardTitle>
        </div>
        {currentSector && (
          <Badge variant="neutral">{currentSector}</Badge>
        )}
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3 font-medium text-muted-foreground">Symbol</th>
              <th className="hidden pb-3 font-medium text-muted-foreground sm:table-cell">
                Company
              </th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Price</th>
              <th className="pb-3 text-right font-medium text-muted-foreground">Change</th>
              <th className="pb-3 pr-2 text-right font-medium text-muted-foreground">Change %</th>
            </tr>
          </thead>
          <tbody>
            {allRows.map((row) => {
              const isCurrent = row.symbol === currentSymbol;
              const isGain = row.changePercent >= 0;
              return (
                <tr
                  key={row.symbol}
                  className={`border-b border-border/50 ${
                    isCurrent
                      ? 'bg-primary/5 font-semibold'
                      : 'hover:bg-muted/50'
                  }`}
                >
                  <td className="py-3">
                    <Link
                      to={`/app/stock/${row.symbol}`}
                      className={`font-medium ${
                        isCurrent
                          ? 'text-primary'
                          : 'text-foreground hover:text-primary'
                      }`}
                    >
                      {row.symbol}
                      {isCurrent && (
                        <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                          (current)
                        </span>
                      )}
                    </Link>
                  </td>
                  <td className="hidden py-3 text-muted-foreground sm:table-cell">
                    <span className="truncate max-w-[200px] block">{row.fullName}</span>
                  </td>
                  <td className="py-3 text-right text-foreground">
                    {row.price > 0 ? formatCurrency(row.price) : '--'}
                  </td>
                  <td
                    className={`py-3 text-right ${
                      isGain ? 'text-gain' : 'text-loss'
                    }`}
                  >
                    {row.change !== 0
                      ? `${isGain ? '+' : ''}${formatCurrency(row.change)}`
                      : '--'}
                  </td>
                  <td className="py-3 pr-2 text-right">
                    {row.changePercent !== 0 ? (
                      <Badge variant={isGain ? 'gain' : 'loss'}>
                        {isGain ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        {formatPercent(row.changePercent)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">--</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
/*  Main stock detail page                                                    */
/* ─────────────────────────────────────────────────────────────────────────── */

export default function StockDetailPage() {
  const { ticker } = useParams<{ ticker: string }>();
  const navigate = useNavigate();
  const symbol = ticker?.toUpperCase() ?? '';

  const { data: companies } = useCompanies();
  const company = companies?.find((c) => c.company === symbol);
  const companyId = company?.company_id ?? '';

  const { data: holding } = useDseHoldingBySymbol(symbol);
  const { data: orders } = useDseOrdersBySymbol(symbol);
  const { data: orderBook } = useOrderBook(companyId);
  const { data: marketDataRaw } = useMarketData(companyId);
  const { data: livePrices } = useLivePrices();
  const { data: favorites } = useFavorites();
  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const isFavorite = favorites?.find((f) => f.company === symbol);

  const handleToggleFavorite = () => {
    if (isFavorite) {
      removeFavorite.mutate(isFavorite._id);
    } else {
      addFavorite.mutate(symbol);
    }
  };

  // Live price entry for this symbol (real-time source)
  const liveEntry = livePrices?.find((l) => l.company === symbol);

  // Price history chart data — API returns newest-first; reverse to oldest→newest for chart
  const chartData = useMemo(() => {
    if (marketDataRaw && marketDataRaw.length > 0) {
      return [...marketDataRaw]
        .slice(0, 90)
        .reverse()
        .map((d) => ({
          date: new Date(d.trade_date).toLocaleDateString('en', { month: 'short', day: 'numeric' }),
          price: d.closing_price,
          volume: d.volume,
        }));
    }
    return [];
  }, [marketDataRaw]);

  // Latest historical close (rightmost chart point after reversal)
  const latestHistoricalClose = chartData[chartData.length - 1]?.price ?? 0;

  // Use LivePrice as the primary current price; fall back to latest historical close
  const latestPrice = liveEntry?.price ?? latestHistoricalClose;
  const priceChange = liveEntry?.change ?? (latestPrice - (chartData[chartData.length - 2]?.price ?? latestPrice));
  const priceChangePercent = liveEntry?.changePercent ?? (latestHistoricalClose > 0 ? (priceChange / latestHistoricalClose) * 100 : 0);
  const isGain = priceChange >= 0;

  // Staleness indicator for order book
  const orderBookAge = orderBook?.sync_timestamp
    ? Math.round((Date.now() - new Date(orderBook.sync_timestamp).getTime()) / 60000)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{symbol}</h1>
              <Badge variant="info">DSE</Badge>
            </div>
            <p className="text-sm text-gray-500">{company?.fullName ?? 'Loading...'}</p>
          </div>
        </div>
        <Button
          variant={isFavorite ? 'secondary' : 'outline'}
          size="sm"
          onClick={handleToggleFavorite}
        >
          <Star
            className={`h-4 w-4 ${isFavorite ? 'fill-amber-400 text-amber-400' : ''}`}
          />
          {isFavorite ? 'Watching' : 'Watch'}
        </Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="text-xs text-gray-500">Price</p>
          <p className="text-xl font-bold text-gray-900">{formatCurrency(latestPrice)}</p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Change</p>
          <p className={`text-xl font-bold ${isGain ? 'text-gain' : 'text-loss'}`}>
            {formatPercent(priceChangePercent)}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Volume</p>
          <p className="text-xl font-bold text-gray-900">
            {chartData[chartData.length - 1]?.volume
              ? formatVolume(chartData[chartData.length - 1].volume)
              : '--'}
          </p>
        </Card>
        <Card>
          <p className="text-xs text-gray-500">Abs Change</p>
          <p className={`text-xl font-bold ${isGain ? 'text-gain' : 'text-loss'}`}>
            {isGain ? '+' : ''}{formatCurrency(priceChange)}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Price History Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Price History (90 Days)</CardTitle>
            <Badge variant="info">
              <Activity className="h-3 w-3" />
              Live
            </Badge>
          </CardHeader>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isGain ? '#22c55e' : '#ef4444'}
                      stopOpacity={0.2}
                    />
                    <stop
                      offset="100%"
                      stopColor={isGain ? '#22c55e' : '#ef4444'}
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  width={60}
                  domain={['auto', 'auto']}
                />
                <Tooltip
                  contentStyle={{
                    background: '#fff',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value) => [formatCurrency(Number(value)), 'Price']}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isGain ? '#22c55e' : '#ef4444'}
                  fill="url(#priceGradient)"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Order Book */}
        <Card>
          <CardHeader>
            <CardTitle>Live Order Book</CardTitle>
            <BarChart3 className="h-4 w-4 text-gray-400" />
          </CardHeader>

          {orderBook?.orders && orderBook.orders.length > 0 ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span>Best Buy: {orderBook.bestBuyPrice > 0 ? formatCurrency(orderBook.bestBuyPrice) : '--'}</span>
                <span className="text-right">Best Sell: {orderBook.bestSellPrice > 0 ? formatCurrency(orderBook.bestSellPrice) : '--'}</span>
              </div>

              <div className="overflow-hidden rounded-lg border border-gray-100">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-2 py-1.5 text-left font-medium text-gain">Buy Qty</th>
                      <th className="px-2 py-1.5 text-left font-medium text-gain">Buy Price</th>
                      <th className="px-2 py-1.5 text-right font-medium text-loss">Sell Price</th>
                      <th className="px-2 py-1.5 text-right font-medium text-loss">Sell Qty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderBook.orders.slice(0, 8).map((entry, i) => (
                      <tr key={i} className="border-t border-gray-50">
                        <td className="px-2 py-1.5 text-gain">
                          {entry.buyQuantity > 0 ? formatNumber(entry.buyQuantity) : '--'}
                        </td>
                        <td className="px-2 py-1.5 text-gain">
                          {entry.buyPrice > 0 ? formatCurrency(entry.buyPrice) : '--'}
                        </td>
                        <td className="px-2 py-1.5 text-right text-loss">
                          {entry.sellPrice > 0 ? formatCurrency(entry.sellPrice) : '--'}
                        </td>
                        <td className="px-2 py-1.5 text-right text-loss">
                          {entry.sellQuantity > 0 ? formatNumber(entry.sellQuantity) : '--'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {orderBookAge !== null && (
                <p className="text-right text-xs text-gray-400">
                  Updated {orderBookAge < 1 ? 'just now' : `${orderBookAge}m ago`}
                </p>
              )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              No order book data available.
            </p>
          )}
        </Card>
      </div>

      {/* My Holding */}
      {holding && (
        <Card>
          <CardHeader>
            <CardTitle>My Position</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
            <div>
              <p className="text-xs text-gray-500">Shares</p>
              <p className="text-sm font-semibold text-gray-900">{formatNumber(holding.shares)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Cost</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.averageCost)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Current Price</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.currentPrice)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Market Value</p>
              <p className="text-sm font-semibold text-gray-900">{formatCurrency(holding.marketValue)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Gain/Loss</p>
              <p className={`text-sm font-semibold ${holding.gainLoss >= 0 ? 'text-gain' : 'text-loss'}`}>
                {formatCurrency(holding.gainLoss)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Return</p>
              <Badge variant={holding.gainLossPercent >= 0 ? 'gain' : 'loss'}>
                {holding.gainLossPercent >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {formatPercent(holding.gainLossPercent)}
              </Badge>
            </div>
          </div>
        </Card>
      )}

      {/* My Orders for This Stock */}
      {orders && orders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>My Orders - {symbol}</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Side</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Qty</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <Badge variant={order.side === 'buy' ? 'gain' : 'loss'}>
                        {order.side.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {order.quantity?.toLocaleString() ?? '--'}
                    </td>
                    <td className="py-3 text-right text-gray-700">
                      {formatCurrency(order.price ?? 0)}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={order.status === 'FILLED' ? 'gain' : 'warning'}>
                        {order.status ?? 'PENDING'}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-gray-500">
                      {order.createdAt ? formatDate(order.createdAt) : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Peer Comparison */}
      <PeerComparisonCard
        currentSymbol={symbol}
        currentSector={company?.marketSegment}
      />
    </div>
  );
}
