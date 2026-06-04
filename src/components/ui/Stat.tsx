import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Stat({
  label,
  value,
  sub,
  accent,
  className,
}: {
  label: ReactNode;
  value: ReactNode;
  sub?: ReactNode;
  accent?: 'default' | 'good' | 'warn' | 'bad';
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
  return (
    <div className={cn('rounded-xl border border-coffee-100 bg-white p-3', className)}>
      <div className="text-xs font-medium text-coffee-500">{label}</div>
      <div className={cn('mt-1 text-xl font-bold tnum', tone)}>{value}</div>
      {sub && <div className="mt-0.5 text-xs text-coffee-500">{sub}</div>}
    </div>
  );
}
