import { useState, useMemo } from 'react';
import { Landmark } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useFunds } from '@/hooks/useFunds';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/format';

interface FundTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none';

const labelClass = 'block text-sm font-medium text-foreground mb-1';

export default function FundTransactionModal({
  open,
  onClose,
}: FundTransactionModalProps) {
  const { data: funds } = useFunds();
  const createTransaction = useCreateTransaction();

  const [selectedFund, setSelectedFund] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [inputMethod, setInputMethod] = useState<'amount' | 'units'>('amount');
  const [amount, setAmount] = useState<number | ''>('');
  const [units, setUnits] = useState<number | ''>('');
  const [navPerUnit, setNavPerUnit] = useState<number | ''>('');
  const [executionDate, setExecutionDate] = useState(
    new Date().toISOString().split('T')[0],
  );

  const calculatedResult = useMemo(() => {
    const nav = typeof navPerUnit === 'number' ? navPerUnit : 0;
    if (!nav) return null;

    if (inputMethod === 'amount' && typeof amount === 'number' && amount > 0) {
      return {
        label: 'Estimated Units',
        value: amount / nav,
        formatted: (amount / nav).toFixed(4),
      };
    }

    if (inputMethod === 'units' && typeof units === 'number' && units > 0) {
      return {
        label: 'Estimated Amount',
        value: units * nav,
        formatted: formatCurrency(units * nav),
      };
    }

    return null;
  }, [inputMethod, amount, units, navPerUnit]);

  function resetForm() {
    setSelectedFund('');
    setType('buy');
    setInputMethod('amount');
    setAmount('');
    setUnits('');
    setNavPerUnit('');
    setExecutionDate(new Date().toISOString().split('T')[0]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const nav = typeof navPerUnit === 'number' ? navPerUnit : 0;
    const resolvedUnits =
      inputMethod === 'units'
        ? Number(units)
        : nav
          ? Number(amount) / nav
          : 0;

    await createTransaction.mutateAsync({
      company: selectedFund,
      type,
      shares: resolvedUnits,
      pricePerShare: nav,
      assetType: 'fund',
      fund: selectedFund,
      units: resolvedUnits,
      navPerUnit: nav,
      executionDate,
    });

    resetForm();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Fund Transaction"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Fund */}
        <div>
          <label className={labelClass}>Fund</label>
          <select
            className={inputClass}
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
            required
          >
            <option value="">Select a fund</option>
            {(funds as Array<{ _id: string; name: string; fullName?: string }> | undefined)?.map(
              (f) => (
                <option key={f._id} value={f._id}>
                  {f.name}
                </option>
              ),
            )}
          </select>
        </div>

        {/* Transaction Type */}
        <div>
          <label className={labelClass}>Transaction Type</label>
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                type === 'buy'
                  ? 'bg-gain text-white'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setType('buy')}
            >
              Buy
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                type === 'sell'
                  ? 'bg-loss text-white'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setType('sell')}
            >
              Sell
            </button>
          </div>
        </div>

        {/* Input Method */}
        <div>
          <label className={labelClass}>Input Method</label>
          <div className="flex rounded-lg bg-muted p-1">
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                inputMethod === 'amount'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setInputMethod('amount')}
            >
              By Amount
            </button>
            <button
              type="button"
              className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                inputMethod === 'units'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground'
              }`}
              onClick={() => setInputMethod('units')}
            >
              By Units
            </button>
          </div>
        </div>

        {/* Amount or Units */}
        <div>
          {inputMethod === 'amount' ? (
            <>
              <label className={labelClass}>Amount Invested (TZS)</label>
              <input
                type="number"
                className={inputClass}
                placeholder="0.00"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value ? Number(e.target.value) : '')
                }
                required
              />
            </>
          ) : (
            <>
              <label className={labelClass}>Number of Units</label>
              <input
                type="number"
                className={inputClass}
                placeholder="0.0000"
                min={0}
                step="0.0001"
                value={units}
                onChange={(e) =>
                  setUnits(e.target.value ? Number(e.target.value) : '')
                }
                required
              />
            </>
          )}
        </div>

        {/* NAV per Unit */}
        <div>
          <label className={labelClass}>NAV per Unit</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0.00"
            min={0}
            step="0.01"
            value={navPerUnit}
            onChange={(e) =>
              setNavPerUnit(e.target.value ? Number(e.target.value) : '')
            }
            required
          />
        </div>

        {/* Calculated Result */}
        {calculatedResult && (
          <div className="rounded-lg border border-border bg-muted/50 px-3 py-2">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Landmark className="h-4 w-4" />
                {calculatedResult.label}
              </span>
              <span className="font-semibold text-foreground">
                {calculatedResult.formatted}
              </span>
            </div>
          </div>
        )}

        {/* Execution Date */}
        <div>
          <label className={labelClass}>Execution Date</label>
          <input
            type="date"
            className={inputClass}
            value={executionDate}
            onChange={(e) => setExecutionDate(e.target.value)}
            required
          />
        </div>

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={createTransaction.isPending}
            className="flex-1"
          >
            Add Fund Transaction
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
