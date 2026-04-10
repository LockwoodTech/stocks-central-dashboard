import { useState, useMemo, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Clock, ArrowUpDown, Building2 } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useDseOrders, useInvestorProfile } from '@/hooks/usePortfolio';
import { useCompanies } from '@/hooks/useStocks';
import { formatCurrency, formatDate } from '@/utils/format';

const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000;

function getOrderStatus(order: { status: string; createdAt: string }) {
  const raw = (order.status ?? '').toUpperCase();

  // Terminal states — return as-is
  if (raw === 'EXECUTED' || raw === 'FILLED') return { label: 'Executed', variant: 'gain' as const };
  if (raw === 'CANCELLED' || raw === 'CANCELED') return { label: 'Cancelled', variant: 'neutral' as const };
  if (raw === 'REJECTED') return { label: 'Rejected', variant: 'loss' as const };
  if (raw === 'EXPIRED') return { label: 'Expired', variant: 'neutral' as const };

  // Partial fills
  if (raw === 'PARTIAL' || raw === 'PARTIALLY_FILLED' || raw === 'PARTIALLY FILLED') {
    // Still check expiry for partial fills
    const age = Date.now() - new Date(order.createdAt).getTime();
    if (age > FIVE_DAYS_MS) return { label: 'Expired (Partial)', variant: 'neutral' as const };
    return { label: 'Partial Fill', variant: 'warning' as const };
  }

  // Pending/open orders — auto-expire if older than 5 days
  const age = Date.now() - new Date(order.createdAt).getTime();
  if (age > FIVE_DAYS_MS) return { label: 'Expired', variant: 'neutral' as const };

  // Active pending states
  if (raw === 'QUEUED' || raw === 'SUBMITTED') return { label: 'Queued', variant: 'info' as const };
  return { label: 'Pending', variant: 'warning' as const };
}

export default function TradePage() {
  const { data: orders, isLoading: ordersLoading } = useDseOrders();
  const { data: companies } = useCompanies();
  const { data: investorProfile, isLoading: profileLoading } = useInvestorProfile();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [selectedStock, setSelectedStock] = useState('');
  const [selectedBroker, setSelectedBroker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const brokers = investorProfile?.brokers ?? [];

  const totalCost = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    return q * p;
  }, [quantity, price]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const brokerName = brokers.find(b => String(b.id) === selectedBroker)?.name || selectedBroker;
    alert(`Order submitted: ${side.toUpperCase()} ${quantity} shares of ${selectedStock} at ${formatCurrency(parseFloat(price))} via ${brokerName}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Trade</h1>
        <p className="text-sm text-muted-foreground">Place orders and view order history</p>
      </div>

      {/* My Brokers Card */}
      {brokers.length > 0 && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {brokers.map((broker) => (
            <Card key={broker.id}>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Building2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{broker.name}</p>
                  {broker.code && (
                    <p className="text-xs text-muted-foreground">Code: {broker.code}</p>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Place Order Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>

          {/* Buy / Sell Tabs */}
          <div className="mb-5 flex rounded-lg bg-muted p-1">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 rounded-md py-3 md:py-2 text-sm font-medium transition-colors ${
                side === 'buy'
                  ? 'bg-gain text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 rounded-md py-3 md:py-2 text-sm font-medium transition-colors ${
                side === 'sell'
                  ? 'bg-loss text-white shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                required
                className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
              >
                <option value="">Select a stock</option>
                {companies?.map((c) => (
                  <option key={c._id} value={c.company}>
                    {c.company} - {c.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-foreground">Broker</label>
              {profileLoading ? (
                <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
              ) : brokers.length > 0 ? (
                <select
                  value={selectedBroker}
                  onChange={(e) => setSelectedBroker(e.target.value)}
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                >
                  <option value="">Select your broker</option>
                  {brokers.map((b) => (
                    <option key={b.id} value={String(b.id)}>
                      {b.name}{b.code ? ` (${b.code})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <p className="rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground">
                  No brokers found. Link your DSE account first.
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-foreground">Price (TZS)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-foreground focus:border-primary focus:outline-none"
                />
              </div>
            </div>

            <div className="rounded-lg bg-muted p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estimated Total</span>
                <span className="font-semibold text-foreground">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant={side === 'buy' ? 'primary' : 'danger'}
              size="lg"
              disabled={!selectedStock || brokers.length === 0}
            >
              {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </Button>
          </form>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Recent orders
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 font-medium text-muted-foreground">Stock</th>
                  <th className="pb-3 font-medium text-muted-foreground">Side</th>
                  <th className="hidden pb-3 text-right font-medium text-muted-foreground sm:table-cell">Qty</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Price</th>
                  <th className="pb-3 text-right font-medium text-muted-foreground">Status</th>
                  <th className="hidden pb-3 text-right font-medium text-muted-foreground md:table-cell">Date</th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-border/50">
                      <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
                      <td className="py-3"><div className="h-4 w-10 animate-pulse rounded bg-muted" /></td>
                      <td className="hidden py-3 sm:table-cell"><div className="h-4 w-10 animate-pulse rounded bg-muted" /></td>
                      <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-muted" /></td>
                      <td className="py-3"><div className="h-4 w-14 animate-pulse rounded bg-muted" /></td>
                      <td className="hidden py-3 md:table-cell"><div className="h-4 w-20 animate-pulse rounded bg-muted" /></td>
                      <td className="py-3"><div className="h-4 w-4 animate-pulse rounded bg-muted" /></td>
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order, idx) => (
                    <>
                      <tr
                        key={order.id}
                        className="cursor-pointer border-b border-border/50 hover:bg-muted/50"
                        onClick={() => setExpandedOrder(expandedOrder === idx ? null : idx)}
                      >
                        <td className="py-3 font-medium text-foreground">
                          {order.security?.symbol ?? '--'}
                        </td>
                        <td className="py-3">
                          <Badge variant={order.side === 'buy' ? 'gain' : 'loss'}>
                            {order.side.toUpperCase()}
                          </Badge>
                        </td>
                        <td className="hidden py-3 text-right text-foreground sm:table-cell">
                          {order.quantity?.toLocaleString() ?? '--'}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {formatCurrency(order.price ?? 0)}
                        </td>
                        <td className="py-3 text-right">
                          {(() => {
                            const s = getOrderStatus(order);
                            return <Badge variant={s.variant}>{s.label}</Badge>;
                          })()}
                        </td>
                        <td className="hidden py-3 text-right text-muted-foreground md:table-cell">
                          {order.createdAt ? formatDate(order.createdAt) : '--'}
                        </td>
                        <td className="py-3 text-right text-muted-foreground">
                          {expandedOrder === idx ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                      </tr>
                      {expandedOrder === idx && (
                        <tr key={`detail-${order.id}`} className="border-b border-border/50 bg-muted/30">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <p className="text-muted-foreground">Control Number</p>
                                <p className="font-medium text-foreground">
                                  {order.controlNumber ?? '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Commission</p>
                                <p className="font-medium text-foreground">
                                  {order.commission ? formatCurrency(order.commission) : '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Order Ref</p>
                                <p className="font-medium text-foreground">
                                  {order.orderRef ?? '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Broker</p>
                                <p className="font-medium text-foreground">
                                  {order.broker ?? '--'}
                                </p>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No orders found. Link your DSE account to see order history.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
