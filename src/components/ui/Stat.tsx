import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

export function Stat({
  label,
  value,
  sub,
  accent,
  icon: Icon,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  accent?: 'default' | 'good' | 'warn' | 'bad';
  icon?: LucideIcon;
  className?: string;
}) {
  const tone =
    accent === 'good'
      ? 'text-emerald-700'
      : accent === 'warn'
        ? 'text-amber-600'
        : accent === 'bad'
          ? 'text-red-600'
          : 'text-coffee-900';
  const iconTone =
    accent === 'good'
      ? 'bg-emerald-50 text-emerald-600'
      : accent === 'warn'
        ? 'bg-amber-50 text-amber-600'
        : accent === 'bad'
          ? 'bg-red-50 text-red-500'
          : 'bg-coffee-50 text-coffee-500';
  return (
    <div
      className={cn(
        'group rounded-xl border border-coffee-100/80 bg-white p-3.5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        {Icon && (
          <span className={cn('flex h-7 w-7 items-center justify-center rounded-lg transition-colors', iconTone)}>
            <Icon className="h-4 w-4" strokeWidth={2.2} />
          </span>
        )}
        <div className="text-xs font-medium text-coffee-500">{label}</div>
      </div>
      <div className={cn('mt-1.5 text-xl font-bold tnum', tone)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-coffee-500">{sub}</div>}
    </div>
  );
}
