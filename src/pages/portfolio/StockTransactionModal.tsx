import { useState, useMemo } from 'react';
import { ArrowDownUp, ChevronDown, ChevronUp } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { calculateDseCosts } from '@/utils/dseCosts';
import { useCompanies } from '@/hooks/useStocks';
import { useCreateTransaction } from '@/hooks/useTransactions';
import { formatCurrency } from '@/utils/format';
import type { CompanyProfile } from '@/types';

interface StockTransactionModalProps {
  open: boolean;
  onClose: () => void;
}

const inputClass =
  'w-full rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none';

const labelClass = 'block text-sm font-medium text-foreground mb-1';

export default function StockTransactionModal({
  open,
  onClose,
}: StockTransactionModalProps) {
  const { data: companies } = useCompanies();
  const createTransaction = useCreateTransaction();

  const [selectedCompany, setSelectedCompany] = useState('');
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [shares, setShares] = useState<number | ''>('');
  const [price, setPrice] = useState<number | ''>('');
  const [brokerageRate, setBrokerageRate] = useState<number>(0.8);
  const [executionDate, setExecutionDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [showBreakdown, setShowBreakdown] = useState(false);

  const costBreakdown = useMemo(() => {
    if (!shares || !price) return null;
    return calculateDseCosts(
      Number(shares),
      Number(price),
      type,
      brokerageRate / 100,
    );
  }, [shares, price, type, brokerageRate]);

  function resetForm() {
    setSelectedCompany('');
    setType('buy');
    setShares('');
    setPrice('');
    setBrokerageRate(0.8);
    setExecutionDate(new Date().toISOString().split('T')[0]);
    setShowBreakdown(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!costBreakdown) return;

    await createTransaction.mutateAsync({
      company: selectedCompany,
      type,
      shares: Number(shares),
      pricePerShare: Number(price),
      assetType: 'stock',
      executionDate,
      brokerage: costBreakdown.brokerage,
    });

    resetForm();
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Stock Transaction"
      className="max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Stock Symbol */}
        <div>
          <label className={labelClass}>Stock Symbol</label>
          <select
            className={inputClass}
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            required
          >
            <option value="">Select a stock</option>
            {(companies as CompanyProfile[] | undefined)?.map((c) => (
              <option key={c._id} value={c._id}>
                {c.company} - {c.fullName}
              </option>
            ))}
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

        {/* Shares & Price */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Shares</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0"
              min={1}
              value={shares}
              onChange={(e) =>
                setShares(e.target.value ? Number(e.target.value) : '')
              }
              required
            />
          </div>
          <div>
            <label className={labelClass}>Price per Share (TZS)</label>
            <input
              type="number"
              className={inputClass}
              placeholder="0.00"
              min={0}
              step="0.01"
              value={price}
              onChange={(e) =>
                setPrice(e.target.value ? Number(e.target.value) : '')
              }
              required
            />
          </div>
        </div>

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

        {/* Brokerage Rate */}
        <div>
          <label className={labelClass}>Brokerage Rate (%)</label>
          <input
            type="number"
            className={inputClass}
            placeholder="0.8"
            min={0}
            step="0.01"
            value={brokerageRate}
            onChange={(e) => setBrokerageRate(Number(e.target.value))}
            required
          />
        </div>

        {/* Cost Breakdown */}
        {costBreakdown && (
          <div className="rounded-lg border border-border bg-muted/50">
            <button
              type="button"
              className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium text-foreground"
              onClick={() => setShowBreakdown((prev) => !prev)}
            >
              <span className="flex items-center gap-1.5">
                <ArrowDownUp className="h-4 w-4 text-muted-foreground" />
                Cost Breakdown
              </span>
              {showBreakdown ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {showBreakdown && (
              <div className="space-y-1 border-t border-border px-3 py-2 text-sm">
                <CostLine
                  label="Gross Consideration"
                  value={costBreakdown.grossConsideration}
                />
                <CostLine
                  label={`Brokerage (${brokerageRate}%)`}
                  value={costBreakdown.brokerage}
                />
                <CostLine label="VAT (18%)" value={costBreakdown.vat} />
                <CostLine label="DSE Fee" value={costBreakdown.dseFee} />
                <CostLine label="CMSA Fee" value={costBreakdown.cmsaFee} />
                <CostLine
                  label="Fidelity Fee"
                  value={costBreakdown.fidelityFee}
                />
                <CostLine label="CDS Fee" value={costBreakdown.cdsFee} />
                <div className="border-t border-border pt-1">
                  <CostLine
                    label="Total Charges"
                    value={costBreakdown.totalCharges}
                  />
                </div>
                <div className="border-t border-border pt-1">
                  <div className="flex items-center justify-between font-bold text-foreground">
                    <span>Net Amount</span>
                    <span>{formatCurrency(costBreakdown.netAmount)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-3">
          <Button
            type="submit"
            loading={createTransaction.isPending}
            className={`flex-1 ${
              type === 'buy'
                ? 'bg-gain hover:bg-gain/90'
                : 'bg-loss hover:bg-loss/90'
            } text-white`}
          >
            {type === 'buy' ? 'Add Buy Transaction' : 'Add Sell Transaction'}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}

function CostLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between text-muted-foreground">
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}
