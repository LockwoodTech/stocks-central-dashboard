import { useState, type FormEvent } from 'react';
import { Bell, BellOff, Trash2, RefreshCw, Plus } from 'lucide-react';
import Card, { CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import {
  useAlerts,
  useCreateAlert,
  useDeleteAlert,
  useToggleAlert,
  useCheckAlerts,
} from '@/hooks/useAlerts';
import { useCompanies } from '@/hooks/useStocks';
import { useSmsBalance } from '@/hooks/useSmsCredits';
import { formatCurrency, formatRelativeTime } from '@/utils/format';
import { Link } from 'react-router-dom';

export default function AlertsPage() {
  const { data: alerts, isLoading } = useAlerts();
  const { data: companies } = useCompanies();
  const createAlert = useCreateAlert();
  const deleteAlert = useDeleteAlert();
  const toggleAlert = useToggleAlert();
  const checkAlerts = useCheckAlerts();

  const [showForm, setShowForm] = useState(false);
  const [company, setCompany] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [targetPrice, setTargetPrice] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const { data: smsBalance } = useSmsBalance();
  const activeAlerts = alerts?.filter((a) => !a.triggered && a.enabled) ?? [];
  const triggeredAlerts = alerts?.filter((a) => a.triggered) ?? [];

  const handleCreate = (e: FormEvent) => {
    e.preventDefault();
    let normalizedPhone = phoneNumber.replace(/[\s\-]/g, '');
    if (normalizedPhone.startsWith('+')) normalizedPhone = normalizedPhone.slice(1);
    if (normalizedPhone.startsWith('0') && normalizedPhone.length === 10) normalizedPhone = '255' + normalizedPhone.slice(1);
    createAlert.mutate(
      {
        company,
        type,
        targetPrice: parseFloat(targetPrice),
        phoneNumber: normalizedPhone,
      },
      {
        onSuccess: () => {
          setCompany('');
          setTargetPrice('');
          setPhoneNumber('');
          setShowForm(false);
        },
      },
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Alerts</h1>
          <p className="text-sm text-gray-500">Get notified when stocks hit your target price</p>
          <div className="mt-1 flex items-center gap-2 text-sm">
            <span className="font-medium text-foreground">{smsBalance?.credits ?? 0} SMS credits</span>
            <Link to="/app/profile#sms-credits" className="text-primary text-xs hover:underline">
              Top up
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => checkAlerts.mutate()}
            loading={checkAlerts.isPending}
          >
            <RefreshCw className="h-4 w-4" />
            Check Now
          </Button>
          <Button size="sm" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4" />
            New Alert
          </Button>
        </div>
      </div>

      {/* New Alert Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Alert</CardTitle>
          </CardHeader>
          <form onSubmit={handleCreate} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Stock</label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select stock</option>
                {companies?.map((c) => (
                  <option key={c._id} value={c.company}>
                    {c.company}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <div className="flex rounded-lg bg-gray-100 p-1">
                <button
                  type="button"
                  onClick={() => setType('buy')}
                  className={`flex-1 rounded-md py-2.5 md:py-1.5 text-sm font-medium transition-colors ${
                    type === 'buy' ? 'bg-gain text-white' : 'text-gray-600'
                  }`}
                >
                  Buy
                </button>
                <button
                  type="button"
                  onClick={() => setType('sell')}
                  className={`flex-1 rounded-md py-2.5 md:py-1.5 text-sm font-medium transition-colors ${
                    type === 'sell' ? 'bg-loss text-white' : 'text-gray-600'
                  }`}
                >
                  Sell
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Target Price (TZS)</label>
              <input
                type="number"
                value={targetPrice}
                onChange={(e) => setTargetPrice(e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="255XXXXXXXXX"
                required
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="flex items-end gap-2">
              <Button type="submit" loading={createAlert.isPending} className="flex-1">
                Create
              </Button>
              <Button variant="ghost" type="button" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Active Alerts ({activeAlerts.length})</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : activeAlerts.length > 0 ? (
            <div className="space-y-3">
              {activeAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-center justify-between rounded-lg border border-gray-100 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        alert.type === 'buy' ? 'bg-gain-bg' : 'bg-loss-bg'
                      }`}
                    >
                      <Bell
                        className={`h-4 w-4 ${
                          alert.type === 'buy' ? 'text-gain' : 'text-loss'
                        }`}
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{alert.company}</span>
                        <Badge variant={alert.type === 'buy' ? 'gain' : 'loss'}>
                          {alert.type.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Target: {formatCurrency(alert.targetPrice)} | Check every {alert.checkInterval}m
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleAlert.mutate(alert._id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                      title={alert.enabled ? 'Disable' : 'Enable'}
                    >
                      {alert.enabled ? (
                        <Bell className="h-4 w-4 text-primary" />
                      ) : (
                        <BellOff className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteAlert.mutate(alert._id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-loss-bg hover:text-loss"
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">
              No active alerts. Create one to get started.
            </p>
          )}
        </Card>

        {/* Triggered Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Triggered Alerts ({triggeredAlerts.length})</CardTitle>
            <Bell className="h-4 w-4 text-amber-500" />
          </CardHeader>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 animate-pulse rounded-lg bg-gray-100" />
              ))}
            </div>
          ) : triggeredAlerts.length > 0 ? (
            <div className="space-y-3">
              {triggeredAlerts.map((alert) => (
                <div
                  key={alert._id}
                  className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-100">
                      <Bell className="h-4 w-4 text-amber-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{alert.company}</span>
                        <Badge variant="warning">TRIGGERED</Badge>
                      </div>
                      <p className="text-xs text-gray-500">
                        Target: {formatCurrency(alert.targetPrice)}
                        {alert.triggeredAt && ` | ${formatRelativeTime(alert.triggeredAt)}`}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteAlert.mutate(alert._id)}
                    className="rounded-lg p-1.5 text-gray-400 hover:bg-loss-bg hover:text-loss"
                    title="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-gray-500">
              No triggered alerts yet.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}
