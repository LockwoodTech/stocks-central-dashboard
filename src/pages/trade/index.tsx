import { useState, useMemo, type FormEvent } from 'react';
import { ChevronDown, ChevronUp, Clock, ArrowUpDown } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { useDseOrders } from '@/hooks/usePortfolio';
import { useCompanies } from '@/hooks/useStocks';
import { formatCurrency, formatDate } from '@/utils/format';

export default function TradePage() {
  const { data: orders, isLoading: ordersLoading } = useDseOrders();
  const { data: companies } = useCompanies();

  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [selectedStock, setSelectedStock] = useState('');
  const [broker, setBroker] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [expandedOrder, setExpandedOrder] = useState<number | null>(null);

  const totalCost = useMemo(() => {
    const q = parseFloat(quantity) || 0;
    const p = parseFloat(price) || 0;
    return q * p;
  }, [quantity, price]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Placeholder: real trading would go through DSE API
    alert(`Order submitted: ${side.toUpperCase()} ${quantity} shares of ${selectedStock} at ${formatCurrency(parseFloat(price))}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Trade</h1>
        <p className="text-sm text-gray-500">Place orders and view order history</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Place Order Form */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Place Order</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-gray-400" />
          </CardHeader>

          {/* Buy / Sell Tabs */}
          <div className="mb-5 flex rounded-lg bg-gray-100 p-1">
            <button
              onClick={() => setSide('buy')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                side === 'buy'
                  ? 'bg-gain text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setSide('sell')}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-colors ${
                side === 'sell'
                  ? 'bg-loss text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sell
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <select
                value={selectedStock}
                onChange={(e) => setSelectedStock(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
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
              <label className="block text-sm font-medium text-gray-700">Broker</label>
              <input
                type="text"
                value={broker}
                onChange={(e) => setBroker(e.target.value)}
                placeholder="Enter broker name"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Quantity</label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                  min="1"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">Price (TZS)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  required
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Estimated Total</span>
                <span className="font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant={side === 'buy' ? 'primary' : 'danger'}
              size="lg"
            >
              {side === 'buy' ? 'Place Buy Order' : 'Place Sell Order'}
            </Button>
          </form>
        </Card>

        {/* Order History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Clock className="h-4 w-4" />
              Recent orders
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="pb-3 font-medium text-gray-500">Stock</th>
                  <th className="pb-3 font-medium text-gray-500">Side</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Qty</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Price</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Status</th>
                  <th className="pb-3 text-right font-medium text-gray-500">Date</th>
                  <th className="pb-3 w-8" />
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-10 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-10 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-16 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-14 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-20 animate-pulse rounded bg-gray-200" /></td>
                      <td className="py-3"><div className="h-4 w-4 animate-pulse rounded bg-gray-200" /></td>
                    </tr>
                  ))
                ) : orders && orders.length > 0 ? (
                  orders.map((order, idx) => (
                    <>
                      <tr
                        key={order.id}
                        className="cursor-pointer border-b border-gray-50 hover:bg-gray-50"
                        onClick={() => setExpandedOrder(expandedOrder === idx ? null : idx)}
                      >
                        <td className="py-3 font-medium text-gray-900">
                          {order.security?.symbol ?? '--'}
                        </td>
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
                        <td className="py-3 text-right text-gray-400">
                          {expandedOrder === idx ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </td>
                      </tr>
                      {expandedOrder === idx && (
                        <tr key={`detail-${order.id}`} className="border-b border-gray-50 bg-gray-50/50">
                          <td colSpan={7} className="px-4 py-3">
                            <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                              <div>
                                <p className="text-gray-500">Control Number</p>
                                <p className="font-medium text-gray-900">
                                  {order.controlNumber ?? '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Commission</p>
                                <p className="font-medium text-gray-900">
                                  {order.commission ? formatCurrency(order.commission) : '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Order Ref</p>
                                <p className="font-medium text-gray-900">
                                  {order.orderRef ?? '--'}
                                </p>
                              </div>
                              <div>
                                <p className="text-gray-500">Broker</p>
                                <p className="font-medium text-gray-900">
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
                    <td colSpan={7} className="py-8 text-center text-gray-500">
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
