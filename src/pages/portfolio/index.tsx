import { useState, useMemo, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
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
} from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useDseHoldings, useChildAccounts } from '@/hooks/usePortfolio';
import { useStockPortfolio, useCompanies } from '@/hooks/useStocks';
import { addTransaction } from '@/api/stocks';
import {
  formatCurrency,
  formatPercent,
  formatNumber,
  gainLossColor,
} from '@/utils/format';

const PIE_COLORS = [
  '#2563eb', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#06b6d4', '#ec4899', '#14b8a6', '#f97316', '#6366f1',
];

export default function PortfolioPage() {
  const { data: holdings, isLoading: holdingsLoading } = useDseHoldings();
  const { data: children } = useChildAccounts();
  const { data: manualPortfolio, refetch: refetchManual } = useStockPortfolio();
  const { data: companies } = useCompanies();

  const [showTxModal, setShowTxModal] = useState(false);
  const [txCompany, setTxCompany] = useState('');
  const [txName, setTxName] = useState('');
  const [txType, setTxType] = useState<'buy' | 'sell'>('buy');
  const [txShares, setTxShares] = useState('');
  const [txPrice, setTxPrice] = useState('');
  const [txLoading, setTxLoading] = useState(false);

  // Computed portfolio metrics
  const totalValue = useMemo(
    () => holdings?.reduce((sum, h) => sum + (h.marketValue ?? 0), 0) ?? 0,
    [holdings],
  );
  const totalGainLoss = useMemo(
    () => holdings?.reduce((sum, h) => sum + (h.gainLoss ?? 0), 0) ?? 0,
    [holdings],
  );
  const totalReturn = totalValue > 0 ? (totalGainLoss / (totalValue - totalGainLoss)) * 100 : 0;

  // Allocation chart data
  const allocationData = useMemo(
    () =>
      holdings
        ?.map((h) => ({
          name: h.company.symbol,
          value: h.marketValue ?? 0,
        }))
        .filter((d) => d.value > 0)
        .sort((a, b) => b.value - a.value) ?? [],
    [holdings],
  );

  const handleAddTransaction = async (e: FormEvent) => {
    e.preventDefault();
    setTxLoading(true);
    try {
      await addTransaction({
        company: txCompany,
        name: txName,
        type: txType,
        shares: parseInt(txShares),
        pricePerShare: parseFloat(txPrice),
      });
      setShowTxModal(false);
      setTxCompany('');
      setTxName('');
      setTxShares('');
      setTxPrice('');
      refetchManual();
    } catch {
      // error handled by interceptor
    } finally {
      setTxLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
          <p className="text-sm text-gray-500">Your DSE investment portfolio overview</p>
        </div>
        <Button size="sm" onClick={() => setShowTxModal(true)}>
          <Plus className="h-4 w-4" />
          Add Transaction
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Wallet className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Value</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalGainLoss >= 0 ? 'bg-gain-bg' : 'bg-loss-bg'}`}>
              {totalGainLoss >= 0 ? (
                <TrendingUp className="h-5 w-5 text-gain" />
              ) : (
                <TrendingDown className="h-5 w-5 text-loss" />
              )}
            </div>
            <div>
              <p className="text-xs text-gray-500">Unrealized P&L</p>
              <p className={`text-lg font-bold ${gainLossColor(totalGainLoss)}`}>
                {formatCurrency(totalGainLoss)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${totalReturn >= 0 ? 'bg-gain-bg' : 'bg-loss-bg'}`}>
              <BarChart3 className={`h-5 w-5 ${totalReturn >= 0 ? 'text-gain' : 'text-loss'}`} />
            </div>
            <div>
              <p className="text-xs text-gray-500">Return</p>
              <p className={`text-lg font-bold ${gainLossColor(totalReturn)}`}>
                {formatPercent(totalReturn)}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Holdings</p>
              <p className="text-lg font-bold text-gray-900">{holdings?.length ?? 0} stocks</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Allocation Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Allocation</CardTitle>
          </CardHeader>
          {allocationData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocationData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      dataKey="value"
                      paddingAngle={2}
                    >
                      {allocationData.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => formatCurrency(Number(value))}
                      contentStyle={{
                        background: '#fff',
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-3 space-y-1">
                {allocationData.slice(0, 5).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}
                      />
                      <span className="text-gray-700">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {((d.value / totalValue) * 100).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">No holdings to display.</p>
          )}
        </Card>

        {/* Holdings List */}
        <Card className="lg:col-span-2" padding={false}>
          <div className="p-5 pb-0">
            <CardHeader>
              <CardTitle>DSE Holdings</CardTitle>
            </CardHeader>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="px-5 pb-3 font-medium text-gray-500">Stock</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Shares</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Avg Cost</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Value</th>
                  <th className="pb-3 pr-5 text-right font-medium text-gray-500">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {holdingsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      {Array.from({ length: 6 }).map((__, j) => (
                        <td key={j} className="px-5 py-3">
                          <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : holdings && holdings.length > 0 ? (
                  holdings.map((h) => (
                    <tr key={h.company.symbol} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        <Link
                          to={`/stock/${h.company.symbol}`}
                          className="font-medium text-gray-900 hover:text-primary"
                        >
                          {h.company.symbol}
                        </Link>
                        <p className="text-xs text-gray-500">{h.company.name}</p>
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {formatNumber(h.shares)}
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {formatCurrency(h.currentPrice)}
                      </td>
                      <td className="py-3 text-right text-gray-700">
                        {formatCurrency(h.averageCost)}
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900">
                        {formatCurrency(h.marketValue)}
                      </td>
                      <td className="py-3 pr-5 text-right">
                        <Badge variant={h.gainLossPercent >= 0 ? 'gain' : 'loss'}>
                          {formatPercent(h.gainLossPercent)}
                        </Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                      No DSE holdings found. Link your DSE account to view holdings.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Off-Platform Portfolio */}
      {manualPortfolio && manualPortfolio.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Off-Platform Holdings</CardTitle>
          </CardHeader>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Stock</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Shares</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Avg Cost</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Invested</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Current</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Gain/Loss</th>
                </tr>
              </thead>
              <tbody>
                {manualPortfolio.map((entry) => (
                  <tr key={entry._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{entry.company}</p>
                      <p className="text-xs text-gray-500">{entry.name}</p>
                    </td>
                    <td className="py-3 text-right text-gray-700">{formatNumber(entry.shares)}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(entry.avgCost)}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(entry.invested)}</td>
                    <td className="py-3 text-right text-gray-700">{formatCurrency(entry.currentValue)}</td>
                    <td className="py-3 text-right">
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
                <Users className="h-5 w-5 text-gray-500" />
                Minor Accounts
              </div>
            </CardTitle>
          </CardHeader>
          <div className="space-y-3">
            {children.map((child) => (
              <div
                key={child.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {child.firstName} {child.lastName}
                  </p>
                  <p className="text-xs text-gray-500">CSD: {child.csdAccount}</p>
                </div>
                <Link
                  to={`/portfolio?child=${child.csdAccount}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  View <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Add Transaction Modal */}
      <Modal open={showTxModal} onClose={() => setShowTxModal(false)} title="Add Off-Platform Transaction">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700">Stock</label>
            <select
              value={txCompany}
              onChange={(e) => {
                setTxCompany(e.target.value);
                const comp = companies?.find((c) => c.company === e.target.value);
                if (comp) setTxName(comp.fullName);
              }}
              required
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select stock</option>
              {companies?.map((c) => (
                <option key={c._id} value={c.company}>
                  {c.company} - {c.fullName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex rounded-lg bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setTxType('buy')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                txType === 'buy' ? 'bg-gain text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Buy
            </button>
            <button
              type="button"
              onClick={() => setTxType('sell')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                txType === 'sell' ? 'bg-loss text-white shadow-sm' : 'text-gray-600'
              }`}
            >
              Sell
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Shares</label>
              <input
                type="number"
                value={txShares}
                onChange={(e) => setTxShares(e.target.value)}
                placeholder="0"
                min="1"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Price per Share</label>
              <input
                type="number"
                value={txPrice}
                onChange={(e) => setTxPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>

          {txShares && txPrice && (
            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total</span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(parseInt(txShares) * parseFloat(txPrice))}
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" loading={txLoading} className="flex-1">
              Add Transaction
            </Button>
            <Button variant="outline" type="button" onClick={() => setShowTxModal(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
