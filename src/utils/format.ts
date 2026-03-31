/**
 * Format a number as TZS currency.
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Short currency (e.g. TZS 1.2M, TZS 340K).
 */
export function formatCurrencyShort(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `TZS ${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `TZS ${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `TZS ${(value / 1_000).toFixed(1)}K`;
  }
  return `TZS ${value.toFixed(0)}`;
}

/**
 * Format a percentage with sign.
 */
export function formatPercent(value: number): string {
  const sign = value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Abbreviate large volumes (e.g. 1.2M, 340K).
 */
export function formatVolume(value: number): string {
  if (Math.abs(value) >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (Math.abs(value) >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toLocaleString();
}

/**
 * Format a number with commas.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-TZ').format(value);
}

/**
 * Format a date string to a readable format.
 */
export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-TZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format a date string to relative time (e.g. "2 hours ago").
 */
export function formatRelativeTime(dateStr: string): string {
  const now = new Date();
  const then = new Date(dateStr);
  const diffMs = now.getTime() - then.getTime();
  const diffMins = Math.floor(diffMs / 60_000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(dateStr);
}

/**
 * Return gain/loss color class.
 */
export function gainLossColor(value: number): string {
  if (value > 0) return 'text-gain';
  if (value < 0) return 'text-loss';
  return 'text-gray-500';
}

/**
 * Return gain/loss background class.
 */
export function gainLossBg(value: number): string {
  if (value > 0) return 'bg-gain-bg text-gain';
  if (value < 0) return 'bg-loss-bg text-loss';
  return 'bg-gray-100 text-gray-500';
}
