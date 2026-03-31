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
  neutral: 'bg-gray-100 text-gray-600',
  info: 'bg-blue-50 text-blue-700',
  warning: 'bg-amber-50 text-amber-700',
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
