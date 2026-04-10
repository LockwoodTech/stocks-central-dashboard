import { useState, useMemo } from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import type {
  StockPortfolioEntry,
  FundPortfolioEntry,
  Transaction,
  CompanyProfile,
} from '@/types';

/* -------------------------------------------------------------------------- */
/*  Constants                                                                 */
/* -------------------------------------------------------------------------- */

type TabKey =
  | 'performance'
  | 'topbottom'
  | 'sectors'
  | 'cashflow'
  | 'assetmix'
  | 'risk'
  | 'monthly'
  | 'concentration';

interface TabDef {
  key: TabKey;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'performance', label: 'Performance' },
  { key: 'topbottom', label: 'Top / Bottom' },
  { key: 'sectors', label: 'Sectors' },
  { key: 'cashflow', label: 'Cash Flow' },
  { key: 'assetmix', label: 'Asset Mix' },
  { key: 'risk', label: 'Risk Profile' },
  { key: 'monthly', label: 'Monthly Returns' },
  { key: 'concentration', label: 'Concentration' },
];

const PIE_COLORS = [
  '#6366f1', '#3b82f6', '#22c55e', '#f59e0b',
  '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6',
  '#f97316', '#6b7280',
];

const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

const fmtCurrency = (value: number) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const fmtPercent = (value: number) => `${value.toFixed(2)}%`;

/* -------------------------------------------------------------------------- */
/*  Shared UI                                                                 */
/* -------------------------------------------------------------------------- */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-card-border bg-card px-3 py-2 text-sm shadow-md">
      {label && <p className="mb-1 font-medium text-foreground">{label}</p>}
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="text-xs">
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
        </p>
      ))}
    </div>
  );
}

function EmptyState({ message, height = 300 }: { message: string; height?: number }) {
  return (
    <div
      className="flex items-center justify-center text-sm text-muted-foreground"
      style={{ height }}
    >
      {message}
    </div>
  );
}

function ChartWrapper({ children, height = 300 }: { children: React.ReactNode; height?: number }) {
  return (
    <div style={{ width: '100%', minHeight: height }}>
      {children}
    </div>
  );
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

/* -------------------------------------------------------------------------- */
/*  Props                                                                     */
/* -------------------------------------------------------------------------- */

interface PortfolioAnalyticsProps {
  stockPortfolio: StockPortfolioEntry[];
  fundPortfolio: FundPortfolioEntry[];
  transactions: Transaction[];
  companies: CompanyProfile[];
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function PortfolioAnalytics({
  stockPortfolio,
  fundPortfolio,
  transactions,
  companies,
}: PortfolioAnalyticsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('performance');

  /* ---- Aggregate values ---- */

  const totalStockValue = useMemo(
    () => (stockPortfolio ?? []).reduce((s, h) => s + (h.currentValue ?? 0), 0),
    [stockPortfolio],
  );

  const totalFundValue = useMemo(
    () => (fundPortfolio ?? []).reduce((s, h) => s + (h.currentValue ?? 0), 0),
    [fundPortfolio],
  );

  const totalValue = totalStockValue + totalFundValue;

  const totalInvested = useMemo(
    () =>
      (stockPortfolio ?? []).reduce((s, h) => s + (h.invested ?? 0), 0) +
      (fundPortfolio ?? []).reduce((s, h) => s + (h.invested ?? 0), 0),
    [stockPortfolio, fundPortfolio],
  );

  const returnPct = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;

  const companyMap = useMemo(() => {
    const map = new Map<string, CompanyProfile>();
    (companies ?? []).forEach((c) => {
      map.set(c.company, c);
    });
    return map;
  }, [companies]);

  /* ------------------------------------------------------------------ */
  /*  1. Performance                                                    */
  /* ------------------------------------------------------------------ */

  const performanceData = useMemo(() => {
    const txs = [...(transactions ?? [])].sort(
      (a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime(),
    );
    if (txs.length === 0) return [];

    const firstDate = new Date(txs[0].executionDate);
    const now = new Date();
    const points: { date: string; value: number }[] = [];

    let cumulative = 0;
    let txIdx = 0;
    const cursor = new Date(firstDate.getFullYear(), firstDate.getMonth(), 1);

    while (cursor <= now) {
      const label = `${MONTH_NAMES[cursor.getMonth()]} ${String(cursor.getFullYear()).slice(2)}`;
      const endOfMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0);

      while (txIdx < txs.length && new Date(txs[txIdx].executionDate) <= endOfMonth) {
        const tx = txs[txIdx];
        cumulative += tx.type === 'sell' ? -tx.totalAmount : tx.totalAmount;
        txIdx++;
      }

      points.push({ date: label, value: Math.round(cumulative) });
      cursor.setMonth(cursor.getMonth() + 1);
    }

    if (points.length > 0) {
      points[points.length - 1].value = Math.round(totalValue);
    }

    return points;
  }, [transactions, totalValue]);

  /* ------------------------------------------------------------------ */
  /*  2. Top / Bottom                                                   */
  /* ------------------------------------------------------------------ */

  const topBottomData = useMemo(() => {
    const items = (stockPortfolio ?? [])
      .map((h) => ({ symbol: h.company, gainPct: h.gainLossPercent ?? 0 }))
      .sort((a, b) => b.gainPct - a.gainPct);

    if (items.length <= 5) return items;
    const top = items.slice(0, 5);
    const bottom = items.slice(-5).reverse();
    const seen = new Set<string>();
    return [...top, ...bottom].filter((d) => {
      if (seen.has(d.symbol)) return false;
      seen.add(d.symbol);
      return true;
    });
  }, [stockPortfolio]);

  /* ------------------------------------------------------------------ */
  /*  3. Sectors                                                        */
  /* ------------------------------------------------------------------ */

  const sectorData = useMemo(() => {
    const sectorMap = new Map<string, number>();

    (stockPortfolio ?? []).forEach((h) => {
      const profile = companyMap.get(h.company);
      const sector = profile?.marketSegment ?? 'Other';
      sectorMap.set(sector, (sectorMap.get(sector) ?? 0) + (h.currentValue ?? 0));
    });

    if (totalFundValue > 0) {
      sectorMap.set('Funds', totalFundValue);
    }

    const total = Array.from(sectorMap.values()).reduce((a, b) => a + b, 0);
    return Array.from(sectorMap.entries())
      .map(([name, value]) => ({
        name,
        value: Math.round(value),
        pct: total > 0 ? Math.round((value / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.value - a.value);
  }, [stockPortfolio, companyMap, totalFundValue]);

  /* ------------------------------------------------------------------ */
  /*  4. Cash Flow                                                      */
  /* ------------------------------------------------------------------ */

  const cashFlowData = useMemo(() => {
    const txs = transactions ?? [];
    if (txs.length === 0) return [];

    const monthMap = new Map<string, { buys: number; sells: number }>();

    txs.forEach((tx) => {
      const d = new Date(tx.executionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key) ?? { buys: 0, sells: 0 };
      if (tx.type === 'sell') {
        entry.sells += tx.totalAmount;
      } else {
        entry.buys += tx.totalAmount;
      }
      monthMap.set(key, entry);
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [, m] = key.split('-');
        return {
          month: MONTH_NAMES[parseInt(m, 10) - 1],
          buys: Math.round(val.buys),
          sells: Math.round(val.sells),
        };
      });
  }, [transactions]);

  /* ------------------------------------------------------------------ */
  /*  5. Asset Mix                                                      */
  /* ------------------------------------------------------------------ */

  const assetMixData = useMemo(() => {
    if (totalValue === 0) return [];
    return [
      {
        name: 'Stocks',
        value: Math.round(totalStockValue),
        pct: Math.round((totalStockValue / totalValue) * 1000) / 10,
      },
      {
        name: 'Funds',
        value: Math.round(totalFundValue),
        pct: Math.round((totalFundValue / totalValue) * 1000) / 10,
      },
    ];
  }, [totalStockValue, totalFundValue, totalValue]);

  /* ------------------------------------------------------------------ */
  /*  6. Risk Profile                                                   */
  /* ------------------------------------------------------------------ */

  const riskData = useMemo(() => {
    const holdingsCount = (stockPortfolio?.length ?? 0) + (fundPortfolio?.length ?? 0);
    const sectorCount = new Set(
      (stockPortfolio ?? []).map((h) => companyMap.get(h.company)?.marketSegment ?? 'Other'),
    ).size;
    const hasFunds = (fundPortfolio?.length ?? 0) > 0;

    const diversification = clamp(holdingsCount * 12 + (hasFunds ? 15 : 0), 0, 100);
    const base = clamp(30 + sectorCount * 8 + holdingsCount * 3, 30, 80);

    return [
      { axis: 'Volatility', value: clamp(85 - holdingsCount * 4, 25, 85) },
      { axis: 'Liquidity', value: clamp(base + 5, 30, 80) },
      { axis: 'Diversification', value: diversification },
      { axis: 'Quality', value: clamp(base, 30, 80) },
      { axis: 'Growth', value: clamp(base - 5, 25, 80) },
    ];
  }, [stockPortfolio, fundPortfolio, companyMap]);

  /* ------------------------------------------------------------------ */
  /*  7. Monthly Returns                                                */
  /* ------------------------------------------------------------------ */

  const monthlyReturnsData = useMemo(() => {
    const txs = transactions ?? [];
    if (txs.length === 0) return [];

    const monthMap = new Map<string, { invested: number; returned: number }>();

    txs.forEach((tx) => {
      const d = new Date(tx.executionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      const entry = monthMap.get(key) ?? { invested: 0, returned: 0 };
      if (tx.type === 'sell') {
        entry.returned += tx.totalAmount;
      } else {
        entry.invested += tx.totalAmount;
      }
      monthMap.set(key, entry);
    });

    return Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, val]) => {
        const [, m] = key.split('-');
        const pct = val.invested > 0
          ? Math.round(((val.returned - val.invested) / val.invested) * 10000) / 100
          : 0;
        return { month: MONTH_NAMES[parseInt(m, 10) - 1], returnPct: pct };
      });
  }, [transactions]);

  /* ------------------------------------------------------------------ */
  /*  8. Concentration                                                  */
  /* ------------------------------------------------------------------ */

  const concentrationData = useMemo(() => {
    if (totalValue === 0) return [];

    const stocks = (stockPortfolio ?? []).map((h) => ({
      name: h.company,
      pct: Math.round((h.currentValue / totalValue) * 1000) / 10,
    }));

    const funds = (fundPortfolio ?? []).map((h) => ({
      name: h.fund,
      pct: Math.round((h.currentValue / totalValue) * 1000) / 10,
    }));

    return [...stocks, ...funds].sort((a, b) => b.pct - a.pct);
  }, [stockPortfolio, fundPortfolio, totalValue]);

  /* ------------------------------------------------------------------ */
  /*  Tab renderers                                                     */
  /* ------------------------------------------------------------------ */

  function renderPerformance() {
    if (performanceData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    return (
      <div className="space-y-4">
        <ChartWrapper>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border, #e5e7eb)" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
              <Tooltip content={<ChartTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                name="Portfolio Value"
                stroke="#2563eb"
                fill="url(#areaGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-muted px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Your Return</p>
            <p className={`text-lg font-bold ${returnPct >= 0 ? 'text-gain' : 'text-loss'}`}>
              {returnPct >= 0 ? '+' : ''}{fmtPercent(returnPct)}
            </p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Current Value</p>
            <p className="text-lg font-bold text-foreground">{fmtCurrency(totalValue)}</p>
          </div>
          <div className="rounded-lg bg-muted px-3 py-2 text-center">
            <p className="text-xs text-muted-foreground">Total Invested</p>
            <p className="text-lg font-bold text-foreground">{fmtCurrency(totalInvested)}</p>
          </div>
        </div>
      </div>
    );
  }

  function renderTopBottom() {
    if (topBottomData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    const h = Math.max(220, topBottomData.length * 40);
    return (
      <ChartWrapper height={h}>
        <ResponsiveContainer width="100%" height={h}>
          <BarChart data={topBottomData} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border, #e5e7eb)" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="symbol" type="category" tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="gainPct" name="Gain/Loss %">
              {topBottomData.map((entry, i) => (
                <Cell key={i} fill={entry.gainPct >= 0 ? '#22c55e' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  function renderSectors() {
    if (sectorData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    return (
      <ChartWrapper>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={sectorData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              dataKey="value"
              nameKey="name"
              paddingAngle={2}
            >
              {sectorData.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend
              formatter={(value: string) => {
                const item = sectorData.find((s) => s.name === value);
                return `${value} (${item?.pct ?? 0}%)`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  function renderCashFlow() {
    if (cashFlowData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    return (
      <ChartWrapper>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={cashFlowData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border, #e5e7eb)" />
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
            <Tooltip content={<ChartTooltip />} />
            <Legend />
            <Bar dataKey="buys" name="Buys" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="sells" name="Sells" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  function renderAssetMix() {
    if (assetMixData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    return (
      <ChartWrapper>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={assetMixData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={110}
              dataKey="value"
              nameKey="name"
              paddingAngle={4}
              label={({ name, pct }) => `${name} ${pct}%`}
            >
              <Cell fill="#2563eb" />
              <Cell fill="#22c55e" />
            </Pie>
            <Tooltip content={<ChartTooltip />} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  function renderRisk() {
    const holdingsCount = (stockPortfolio?.length ?? 0) + (fundPortfolio?.length ?? 0);
    if (holdingsCount === 0) {
      return <EmptyState message="No data available" height={320} />;
    }
    return (
      <ChartWrapper height={320}>
        <ResponsiveContainer width="100%" height={320}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={riskData}>
            <PolarGrid stroke="var(--color-card-border, #e5e7eb)" />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 12 }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Risk Profile"
              dataKey="value"
              stroke="#6366f1"
              fill="#6366f1"
              fillOpacity={0.25}
            />
            <Tooltip content={<ChartTooltip />} />
          </RadarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  function renderMonthlyReturns() {
    if (monthlyReturnsData.length === 0) {
      return <EmptyState message="No data available" height={280} />;
    }
    const positive = monthlyReturnsData.filter((d) => d.returnPct > 0).length;
    const negative = monthlyReturnsData.filter((d) => d.returnPct < 0).length;

    return (
      <div className="space-y-4">
        <ChartWrapper height={280}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyReturnsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border, #e5e7eb)" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="returnPct" name="Return %">
                {monthlyReturnsData.map((entry, i) => (
                  <Cell key={i} fill={entry.returnPct >= 0 ? '#22c55e' : '#ef4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
        <div className="flex gap-3">
          <span className="rounded-full bg-gain-bg px-3 py-1 text-xs font-medium text-gain">
            {positive} positive month{positive !== 1 ? 's' : ''}
          </span>
          <span className="rounded-full bg-loss-bg px-3 py-1 text-xs font-medium text-loss">
            {negative} negative month{negative !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    );
  }

  function renderConcentration() {
    if (concentrationData.length === 0) {
      return <EmptyState message="No data available" />;
    }
    const h = Math.max(220, concentrationData.length * 36);
    return (
      <ChartWrapper height={h}>
        <ResponsiveContainer width="100%" height={h}>
          <BarChart data={concentrationData} layout="vertical" margin={{ left: 50 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-card-border, #e5e7eb)" />
            <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<ChartTooltip />} />
            <Bar dataKey="pct" name="Portfolio %" fill="#2563eb" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    );
  }

  /* ------------------------------------------------------------------ */
  /*  Tab map                                                           */
  /* ------------------------------------------------------------------ */

  const tabContent: Record<TabKey, () => React.JSX.Element> = {
    performance: renderPerformance,
    topbottom: renderTopBottom,
    sectors: renderSectors,
    cashflow: renderCashFlow,
    assetmix: renderAssetMix,
    risk: renderRisk,
    monthly: renderMonthlyReturns,
    concentration: renderConcentration,
  };

  /* ------------------------------------------------------------------ */
  /*  Render                                                            */
  /* ------------------------------------------------------------------ */

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold text-foreground">Portfolio Analytics</h2>
        <p className="text-sm text-muted-foreground">
          Analysis based on {stockPortfolio?.length ?? 0} stock
          {(stockPortfolio?.length ?? 0) !== 1 ? 's' : ''} and{' '}
          {fundPortfolio?.length ?? 0} fund
          {(fundPortfolio?.length ?? 0) !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Tab pills — horizontally scrollable */}
      <div className="-mx-1 overflow-x-auto px-1 pb-1">
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-border'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <Card>
        <CardHeader>
          <CardTitle>{TABS.find((t) => t.key === activeTab)?.label}</CardTitle>
        </CardHeader>
        {tabContent[activeTab]()}
      </Card>
    </div>
  );
}
