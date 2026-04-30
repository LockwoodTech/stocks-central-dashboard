import { TrendingUp, TrendingDown } from 'lucide-react';
import { useLivePrices } from '@/hooks/useStocks';
import { formatCurrency } from '@/utils/format';

export default function TickerBar() {
  const { data: prices } = useLivePrices();

  if (!prices || prices.length === 0) return null;

  // Duplicate items for seamless infinite scroll
  const items = [...prices, ...prices];

  return (
    <div className="overflow-hidden border-b border-card-border bg-card">
      <div className="ticker-track flex whitespace-nowrap">
        {items.map((p, i) => {
          const isPositive = p.change >= 0;
          return (
            <span
              key={`${p.company}-${i}`}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium"
            >
              <span className="font-semibold text-foreground">{p.company}</span>
              <span className="text-muted-foreground">{formatCurrency(p.price)}</span>
              <span
                className={`inline-flex items-center gap-0.5 ${
                  isPositive ? 'text-gain' : 'text-loss'
                }`}
              >
                {isPositive ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {isPositive ? '+' : ''}
                {p.change.toFixed(2)} ({isPositive ? '+' : ''}
                {p.changePercent.toFixed(1)}%)
              </span>
              <span className="px-1 text-border">|</span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
