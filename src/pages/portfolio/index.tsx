import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  BarChart3,
  Users,
  Plus,
  ChevronRight,
  ChevronDown,
  Loader2,
  RefreshCw,
  Trash2,
  Target,
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useDseHoldings, useChildAccounts } from '@/hooks/usePortfolio';
import { useStockPortfolio, useCompanies } from '@/hooks/useStocks';
import { useFundPortfolio, useFunds } from '@/hooks/useFunds';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { useGoals, useDeleteGoal } from '@/hooks/useGoals';
import { getDseOrdersBySymbol } from '@/api/portfolio';
import { calculateDseCosts } from '@/utils/dseCosts';
import PortfolioAnalytics from './PortfolioAnalytics';
import StockTransactionModal from './StockTransactionModal';
import FundTransactionModal from './FundTransactionModal';
import CreateGoalModal from './CreateGoalModal';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatDate,
  gainLossColor,
} from '@/utils/format';
import type { DseOrder } from '@/types';

type Tab = 'stocks' | 'funds' | 'transactions' | 'goals' | 'analytics';

const TABS: { key: Tab; label: string }[] = [
  { key: 'stocks', label: 'Stocks' },
  { key: 'funds', label: 'Funds' },
  { key: 'transactions', label: 'Transactions' },
  { key: 'goals', label: 'Goals' },
  { key: 'analytics', label: 'Analytics' },
];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState<Tab>('stocks');
  const [showStockTxModal, setShowStockTxModal] = useState(false);
  const [showFundTxModal, setShowFundTxModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);

  // Data hooks
  const { data: holdings, isLoading: holdingsLoading } = useDseHoldings();
  const { data: children } = useChildAccounts();
  const { data: manualPortfolio } = useStockPortfolio();
  const { data: companies } = useCompanies();
  const { data: fundPortfolio, isLoading: fundsLoading } = useFundPortfolio();
  const { data: funds } = useFunds();
  const { data: transactions, isLoading: txLoading } = useTransactions();
  const { data: goals, isLoading: goalsLoading } = useGoals();
  const deleteTx = useDeleteTransaction();
  const deleteGoalMut = useDeleteGoal();

  // Expandable rows for stocks tab
  const [expandedSymbol, setExpandedSymbol] = useState<string | null>(null);
  const [expandedOrders, setExpandedOrders] = useState<DseOrder[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Expandable cost breakdown for transactions tab
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);

  // Transaction filters
  const [txAssetFilter, setTxAssetFilter] = useState<string>('all');
  const [txTypeFilter, setTxTypeFilter] = useState<string>('all');

  // Combined portfolio metrics
  const metrics = useMemo(() => {
    const stockValue = manualPortfolio?.reduce((s, e) => s + e.currentValue, 0) ?? 0;
    const stockInvested = manualPortfolio?.reduce((s, e) => s + e.invested, 0) ?? 0;
    const fundValue = fundPortfolio?.reduce((s, e) => s + e.currentValue, 0) ?? 0;
    const fundInvested = fundPortfolio?.reduce((s, e) => s + e.invested, 0) ?? 0;
    const dseValue = holdings?.reduce((s, h) => s + (h.marketValue ?? 0), 0) ?? 0;
    const totalValue = stockValue + fundValue + dseValue;
    const totalInvested = stockInvested + fundInvested;
    const totalReturn = totalInvested > 0 ? ((totalValue - totalInvested) / totalInvested) * 100 : 0;
    const holdingsCount = (manualPortfolio?.length ?? 0) + (fundPortfolio?.length ?? 0) + (holdings?.length ?? 0);
    return { totalValue, totalInvested, totalReturn, holdingsCount };
  }, [manualPortfolio, fundPortfolio, holdings]);

  // Filtered transactions
  const filteredTx = useMemo(() => {
    if (!transactions) return [];
    return transactions.filter((t) => {
      if (txAssetFilter !== 'all' && t.assetType !== txAssetFilter) return false;
      if (txTypeFilter !== 'all' && t.type !== txTypeFilter) return false;
      return true;
    });
  }, [transactions, txAssetFilter, txTypeFilter]);

  const handleExpandRow = async (symbol: string) => {
    if (expandedSymbol === symbol) {
      setExpandedSymbol(null);
      setExpandedOrders([]);
      return;
    }
    setExpandedSymbol(symbol);
    setOrdersLoading(true);
    try {
      const orders = await getDseOrdersBySymbol(symbol);
      setExpandedOrders(orders);
    } catch {
      setExpandedOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const getOrderStatus = (order: DseOrder) => {
    const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;
    const raw = (order.status ?? '').toUpperCase();

    if (raw === 'EXECUTED' || raw === 'FILLED') return { label: 'Executed', variant: 'gain' as const };
    if (raw === 'CANCELLED' || raw === 'CANCELED') return { label: 'Cancelled', variant: 'neutral' as const };
    if (raw === 'REJECTED') return { label: 'Rejected', variant: 'loss' as const };
    if (raw === 'EXPIRED') return { label: 'Expired', variant: 'neutral' as const };

    if (raw === 'PARTIAL' || raw === 'PARTIALLY_FILLED' || raw === 'PARTIALLY FILLED') {
      const age = Date.now() - new Date(order.createdAt).getTime();
      if (age > FIVE_DAYS_MS) return { label: 'Expired (Partial)', variant: 'neutral' as const };
      return { label: 'Partial Fill', variant: 'warning' as const };
    }

    const age = Date.now() - new Date(order.createdAt).getTime();
    if (age > FIVE_DAYS_MS) return { label: 'Expired', variant: 'neutral' as const };

    if (raw === 'QUEUED' || raw === 'SUBMITTED') return { label: 'Queued', variant: 'info' as const };
    return { label: 'Pending', variant: 'warning' as const };
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Portfolio</h1>
          <p className="text-sm text-muted-foreground">Your DSE investment portfolio overview</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowFundTxModal(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Fund Tx</span>
          </Button>
          <Button size="sm" onClick={() => setShowStockTxModal(true)}>
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Stock Tx</span>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Value</p>
              <p className="text-base font-bold text-foreground lg:text-lg">{formatCurrency(metrics.totalValue)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Invested</p>
              <p className="text-base font-bold text-foreground lg:text-lg">{formatCurrency(metrics.totalInvested)}</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${metrics.totalReturn >= 0 ? 'bg-gain-bg' : 'bg-loss-bg'}`}>
              {metrics.totalReturn >= 0 ? <TrendingUp className="h-5 w-5 text-gain" /> : <TrendingDown className="h-5 w-5 text-loss" />}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Total Return</p>
              <p className={`text-base font-bold lg:text-lg ${gainLossColor(metrics.totalReturn)}`}>
                {formatPercent(metrics.totalReturn)}
              </p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Holdings</p>
              <p className="text-base font-bold text-foreground lg:text-lg">{metrics.holdingsCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Portfolio Analytics */}
      <PortfolioAnalytics
        stockPortfolio={manualPortfolio ?? []}
        fundPortfolio={fundPortfolio ?? []}
        transactions={transactions ?? []}
        companies={companies ?? []}
      />

      {/* Tab Bar */}
      <div className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`whitespace-nowrap rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'stocks' && (
        <div className="space-y-6">
          {/* DSE Holdings */}
          <Card padding={false}>
            <div className="p-5 pb-0">
              <CardHeader>
                <CardTitle>DSE Holdings</CardTitle>
              </CardHeader>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 pb-3 font-medium text-muted-foreground">Stock</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Shares</th>
                    <th className="hidden pb-3 text-right font-medium text-muted-foreground sm:table-cell">Price</th>
                    <th className="hidden pb-3 text-right font-medium text-muted-foreground md:table-cell">Avg Cost</th>
                    <th className="pb-3 text-right font-medium text-muted-foreground">Value</th>
                    <th className="pb-3 pr-5 text-right font-medium text-muted-foreground">G/L</th>
                  </tr>
                </thead>
                <tbody>
                  {holdingsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-border/50">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-5 py-3">
                            <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : holdings && holdings.length > 0 ? (
                    holdings.map((h) => {
                      const symbol = h.company.symbol;
                      const isExpanded = expandedSymbol === symbol;
                      return (
                        <tbody key={symbol}>
                          <tr
                            onClick={() => handleExpandRow(symbol)}
                            className="cursor-pointer border-b border-border/50 hover:bg-muted/50"
                          >
                            <td className="px-5 py-3">
                              <div className="flex items-center gap-2">
                                <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} />
                                <div>
                                  <p className="font-medium text-foreground">{symbol}</p>
                                  <p className="text-xs text-muted-foreground">{h.company.name}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 text-right text-foreground">{formatNumber(h.shares)}</td>
                            <td className="hidden py-3 text-right text-foreground sm:table-cell">{formatCurrency(h.currentPrice)}</td>
                            <td className="hidden py-3 text-right text-foreground md:table-cell">{formatCurrency(h.averageCost)}</td>
                            <td className="py-3 text-right font-medium text-foreground">{formatCurrency(h.marketValue)}</td>
                            <td className="py-3 pr-5 text-right">
                              <Badge variant={h.gainLossPercent >= 0 ? 'gain' : 'loss'}>
                                {formatPercent(h.gainLossPercent)}
                              </Badge>
                            </td>
                          </tr>
                          {isExpanded && (
                            <tr>
                              <td colSpan={6} className="bg-muted/30 px-5 py-3">
                                {ordersLoading ? (
                                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Loading orders...
                                  </div>
                                ) : expandedOrders.length > 0 ? (
                                  <div>
                                    <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Orders for {symbol}</p>
                                    <table className="w-full text-xs">
                                      <thead>
                                        <tr className="border-b border-border/50">
                                          <th className="pb-2 text-left font-medium text-muted-foreground">Side</th>
                                          <th className="pb-2 text-right font-medium text-muted-foreground">Qty</th>
                                          <th className="pb-2 text-right font-medium text-muted-foreground">Price</th>
                                          <th className="pb-2 text-right font-medium text-muted-foreground">Status</th>
                                          <th className="pb-2 text-right font-medium text-muted-foreground">Date</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {expandedOrders.map((order) => {
                                          const status = getOrderStatus(order);
                                          return (
                                            <tr key={order.id || order.orderRef} className="border-b border-border/30">
                                              <td className="py-1.5">
                                                <Badge variant={order.side === 'buy' ? 'gain' : 'loss'}>
                                                  {order.side.toUpperCase()}
                                                </Badge>
                                              </td>
                                              <td className="py-1.5 text-right text-foreground">{formatNumber(order.quantity)}</td>
                                              <td className="py-1.5 text-right text-foreground">{formatCurrency(order.price)}</td>
                                              <td className="py-1.5 text-right">
                                                <Badge variant={status.variant}>{status.label}</Badge>
                                              </td>
                                              <td className="py-1.5 text-right text-muted-foreground">
                                                {new Date(order.createdAt).toLocaleDateString()}
                                              </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <p className="py-2 text-center text-xs text-muted-foreground">No orders found for {symbol}.</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </tbody>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-center text-muted-foreground">
                        No DSE holdings found. Link your DSE account to view holdings.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Off-Platform Portfolio */}
          {manualPortfolio && manualPortfolio.length > 0 && (
            <Card padding={false}>
              <div className="p-5 pb-0">
                <CardHeader>
                  <CardTitle>Off-Platform Holdings</CardTitle>
                </CardHeader>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="px-5 pb-3 font-medium text-muted-foreground">Stock</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Shares</th>
                      <th className="hidden pb-3 text-right font-medium text-muted-foreground sm:table-cell">Avg Cost</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Invested</th>
                      <th className="pb-3 text-right font-medium text-muted-foreground">Current</th>
                      <th className="pb-3 pr-5 text-right font-medium text-muted-foreground">G/L</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manualPortfolio.map((entry) => (
                      <tr key={entry._id} className="border-b border-border/50 hover:bg-muted/50">
                        <td className="px-5 py-3">
                          <p className="font-medium text-foreground">{entry.company}</p>
                          <p className="text-xs text-muted-foreground">{entry.name}</p>
                        </td>
                        <td className="py-3 text-right text-foreground">{formatNumber(entry.shares)}</td>
                        <td className="hidden py-3 text-right text-foreground sm:table-cell">{formatCurrency(entry.avgCost)}</td>
                        <td className="py-3 text-right text-foreground">{formatCurrency(entry.invested)}</td>
                        <td className="py-3 text-right text-foreground">{formatCurrency(entry.currentValue)}</td>
                        <td className="py-3 pr-5 text-right">
                          <span className={`text-sm font-medium ${gainLossColor(entry.gainLoss)}`}>
                            {formatCurrency(entry.gainLoss)} ({formatPercent(entry.gainLossPercent)})
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Minor Accounts */}
          {children && children.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    Minor Accounts
                  </div>
                </CardTitle>
              </CardHeader>
              <div className="space-y-3">
                {children.map((child) => (
                  <div key={child.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium text-foreground">{child.firstName} {child.lastName}</p>
                      <p className="text-xs text-muted-foreground">CSD: {child.csdAccount}</p>
                    </div>
                    <Link to={`/portfolio?child=${child.csdAccount}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
                      View <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'funds' && (
        <Card padding={false}>
          <div className="flex items-center justify-between p-5 pb-0">
            <CardHeader>
              <CardTitle>Fund Holdings</CardTitle>
            </CardHeader>
            <Button size="sm" variant="outline" onClick={() => setShowFundTxModal(true)}>
              <Plus className="h-4 w-4" /> Add Fund Tx
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 pb-3 font-medium text-muted-foreground">Fund</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Units</th>
                  <th className="hidden pb-3 text-right font-medium text-muted-foreground sm:table-cell">Avg Cost</th>
                  <th className="hidden pb-3 text-right font-medium text-muted-foreground md:table-cell">NAV</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Invested</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Current</th>
                  <th className="pb-3 pr-5 text-right font-medium text-muted-foreground">G/L</th>
                </tr>
              </thead>
              <tbody>
                {fundsLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : fundPortfolio && fundPortfolio.length > 0 ? (
                  fundPortfolio.map((f) => (
                    <tr key={f._id} className="border-b border-border/50 hover:bg-muted/50">
                      <td className="px-5 py-3">
                        <p className="font-medium text-foreground">{f.fund}</p>
                        <p className="text-xs text-muted-foreground">{f.type}</p>
                      </td>
                      <td className="py-3 text-right text-foreground">{formatNumber(f.units)}</td>
                      <td className="hidden py-3 text-right text-foreground sm:table-cell">{formatCurrency(f.avgCost)}</td>
                      <td className="hidden py-3 text-right text-foreground md:table-cell">{formatCurrency(f.currentNAV)}</td>
                      <td className="py-3 text-right text-foreground">{formatCurrency(f.invested)}</td>
                      <td className="py-3 text-right text-foreground">{formatCurrency(f.currentValue)}</td>
                      <td className="py-3 pr-5 text-right">
                        <Badge variant={f.gainLossPercent >= 0 ? 'gain' : 'loss'}>
                          {formatPercent(f.gainLossPercent)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No fund holdings yet. Add a fund transaction to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'transactions' && (
        <Card padding={false}>
          <div className="flex flex-col gap-3 p-5 pb-0 sm:flex-row sm:items-center sm:justify-between">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <div className="flex gap-2">
              <select
                value={txAssetFilter}
                onChange={(e) => setTxAssetFilter(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Assets</option>
                <option value="stock">Stocks</option>
                <option value="fund">Funds</option>
              </select>
              <select
                value={txTypeFilter}
                onChange={(e) => setTxTypeFilter(e.target.value)}
                className="rounded-lg border border-border bg-card px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="all">All Types</option>
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 pb-3 font-medium text-muted-foreground">Date</th>
                  <th className="pb-3 font-medium text-muted-foreground">Asset</th>
                  <th className="pb-3 font-medium text-muted-foreground">Type</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Qty</th>
                  <th className="hidden pb-3 text-right font-medium text-muted-foreground sm:table-cell">Price</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Total</th>
                  <th className="pb-3 pr-5 text-right font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {txLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : filteredTx.length > 0 ? (
                  filteredTx.map((tx) => {
                    const isExpanded = expandedTxId === tx._id;
                    const costs = tx.assetType === 'stock'
                      ? calculateDseCosts(tx.shares, tx.pricePerShare, tx.type)
                      : null;
                    return (
                      <tbody key={tx._id}>
                        <tr
                          onClick={() => setExpandedTxId(isExpanded ? null : tx._id)}
                          className="cursor-pointer border-b border-border/50 hover:bg-muted/50"
                        >
                          <td className="px-5 py-3 text-foreground">{formatDate(tx.executionDate)}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <Badge variant={tx.assetType === 'fund' ? 'info' : 'neutral'}>
                                {tx.assetType === 'fund' ? 'Fund' : 'Stock'}
                              </Badge>
                              <span className="font-medium text-foreground">{tx.company}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <Badge variant={tx.type === 'buy' ? 'gain' : 'loss'}>
                              {tx.type.toUpperCase()}
                            </Badge>
                          </td>
                          <td className="py-3 text-right text-foreground">{formatNumber(tx.shares)}</td>
                          <td className="hidden py-3 text-right text-foreground sm:table-cell">{formatCurrency(tx.pricePerShare)}</td>
                          <td className="py-3 text-right font-medium text-foreground">{formatCurrency(tx.totalAmount)}</td>
                          <td className="py-3 pr-5 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (confirm('Delete this transaction?')) {
                                  deleteTx.mutate(tx._id);
                                }
                              }}
                              className="rounded p-1 text-muted-foreground hover:bg-loss-bg hover:text-loss"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                        {isExpanded && costs && (
                          <tr>
                            <td colSpan={7} className="bg-muted/30 px-5 py-3">
                              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">DSE Cost Breakdown</p>
                              <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs sm:grid-cols-3">
                                <div className="flex justify-between"><span className="text-muted-foreground">Gross</span><span className="text-foreground">{formatCurrency(costs.grossConsideration)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Brokerage ({(costs.brokerageRate * 100).toFixed(1)}%)</span><span className="text-foreground">{formatCurrency(costs.brokerage)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">VAT (18%)</span><span className="text-foreground">{formatCurrency(costs.vat)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">DSE Fee</span><span className="text-foreground">{formatCurrency(costs.dseFee)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">CMSA Fee</span><span className="text-foreground">{formatCurrency(costs.cmsaFee)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">Fidelity</span><span className="text-foreground">{formatCurrency(costs.fidelityFee)}</span></div>
                                <div className="flex justify-between"><span className="text-muted-foreground">CDS Fee</span><span className="text-foreground">{formatCurrency(costs.cdsFee)}</span></div>
                                <div className="flex justify-between font-semibold"><span className="text-muted-foreground">Total Charges</span><span className="text-foreground">{formatCurrency(costs.totalCharges)}</span></div>
                                <div className="flex justify-between font-bold"><span className="text-foreground">Net Amount</span><span className="text-foreground">{formatCurrency(costs.netAmount)}</span></div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-muted-foreground">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {activeTab === 'goals' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Financial Goals</h2>
            <Button size="sm" onClick={() => setShowGoalModal(true)}>
              <Plus className="h-4 w-4" /> Create Goal
            </Button>
          </div>
          {goalsLoading ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <Card key={i}>
                  <div className="space-y-3">
                    <div className="h-5 w-32 animate-pulse rounded bg-muted" />
                    <div className="h-3 w-full animate-pulse rounded bg-muted" />
                    <div className="h-20 w-full animate-pulse rounded bg-muted" />
                  </div>
                </Card>
              ))}
            </div>
          ) : goals && goals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {goals.map((goal) => (
                <Card key={goal._id}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="h-5 w-5 text-primary" />
                        <div>
                          <h3 className="font-semibold text-foreground">{goal.name}</h3>
                          <p className="text-xs text-muted-foreground">{goal.type} Goal</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={goal.status === 'On Track' ? 'gain' : goal.status === 'Behind Target' ? 'loss' : 'neutral'}>
                          {goal.status}
                        </Badge>
                        <button
                          onClick={() => {
                            if (confirm('Delete this goal?')) deleteGoalMut.mutate(goal._id);
                          }}
                          className="rounded p-1 text-muted-foreground hover:bg-loss-bg hover:text-loss"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div>
                      <div className="mb-1 flex justify-between text-xs">
                        <span className="text-muted-foreground">{formatPercent(goal.progressPercent).replace('+', '')}</span>
                        <span className="text-muted-foreground">{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${goal.progressPercent >= 75 ? 'bg-gain' : goal.progressPercent >= 40 ? 'bg-amber-500' : 'bg-loss'}`}
                          style={{ width: `${Math.min(goal.progressPercent, 100)}%` }}
                        />
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-muted-foreground">Monthly Avg</p>
                        <p className="font-medium text-foreground">{formatCurrency(goal.monthlyAverage)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Monthly Target</p>
                        <p className="font-medium text-foreground">{formatCurrency(goal.monthlyTarget)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Expected Final</p>
                        <p className="font-medium text-foreground">{formatCurrency(goal.projection?.expectedFinalAmount ?? 0)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Shortfall</p>
                        <p className={`font-medium ${(goal.projection?.shortfall ?? 0) > 0 ? 'text-loss' : 'text-gain'}`}>
                          {formatCurrency(goal.projection?.shortfall ?? 0)}
                        </p>
                      </div>
                    </div>

                    {goal.timeRemaining && (
                      <p className="text-xs text-muted-foreground">Time remaining: {goal.timeRemaining}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <div className="py-8 text-center">
                <Target className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No financial goals yet.</p>
                <Button size="sm" className="mt-3" onClick={() => setShowGoalModal(true)}>
                  Create Your First Goal
                </Button>
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'analytics' && (
        <Card>
          <CardHeader>
            <CardTitle>Portfolio Growth</CardTitle>
          </CardHeader>
          {transactions && transactions.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={(() => {
                    const sorted = [...transactions].sort((a, b) => new Date(a.executionDate).getTime() - new Date(b.executionDate).getTime());
                    let cumulative = 0;
                    return sorted.map((t) => {
                      cumulative += t.type === 'buy' ? t.totalAmount : -t.totalAmount;
                      return {
                        date: new Date(t.executionDate).toLocaleDateString('en-TZ', { month: 'short', year: '2-digit' }),
                        value: cumulative,
                      };
                    });
                  })()}
                >
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="hsl(0 0% 45%)" />
                  <YAxis tick={{ fontSize: 11 }} stroke="hsl(0 0% 45%)" tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(value), 'Total Invested']}
                    contentStyle={{
                      background: 'var(--color-card)',
                      border: '1px solid var(--color-card-border)',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#2563eb" fill="#2563eb" fillOpacity={0.1} strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">Add transactions to see your portfolio growth chart.</p>
          )}
        </Card>
      )}

      {/* Modals */}
      <StockTransactionModal open={showStockTxModal} onClose={() => setShowStockTxModal(false)} />
      <FundTransactionModal open={showFundTxModal} onClose={() => setShowFundTxModal(false)} />
      <CreateGoalModal open={showGoalModal} onClose={() => setShowGoalModal(false)} />
    </div>
  );
}
