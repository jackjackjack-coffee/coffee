import type { ReactNode } from 'react';
import { cn } from '../../lib/cn';
import { CountUp } from './CountUp';

export function Stat({
  label,
  value,
  amount,
  format,
  sub,
  accent,
  className,
}: {
  label: ReactNode;
  /** Pre-formatted value. Ignored when `amount` + `format` are provided. */
  value?: ReactNode;
  /** Raw number to animate with a count-up effect. Requires `format`. */
  amount?: number;
  /** Formatter applied to the animated value (e.g. `fmt.money`). */
  format?: (n: number) => string;
  sub?: ReactNode;
  accent?: 'default' | 'good' | 'warn' | 'bad';
  className?: string;
}) {
  const tone =
    accent === 'good'
      ? 'text-mint'
      : accent === 'warn'
        ? 'text-gold'
        : accent === 'bad'
          ? 'text-rose-600'
          : 'text-coffee-900';
  return (
    <div className={cn('glass rounded-xl p-3', className)}>
      <div className="text-xs font-medium text-coffee-400">{label}</div>
      <div className={cn('mt-1 text-xl font-bold tnum', tone)}>
        {amount !== undefined && format ? <CountUp value={amount} format={format} /> : value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-coffee-400">{sub}</div>}
    </div>
  );
}
