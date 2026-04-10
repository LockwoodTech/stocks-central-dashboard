import { clsx } from 'clsx';

type BadgeVariant = 'gain' | 'loss' | 'neutral' | 'info' | 'warning';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  gain: 'bg-gain-bg text-gain',
  loss: 'bg-loss-bg text-loss',
  neutral: 'bg-muted text-muted-foreground',
  info: 'bg-primary/10 text-primary',
  warning: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export default function Badge({ variant = 'neutral', children, className }: BadgeProps) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
        variantStyles[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
