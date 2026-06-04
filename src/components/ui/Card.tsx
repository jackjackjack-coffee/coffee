import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '../../lib/cn';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...rest} />;
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-3 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-lg font-semibold text-coffee-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-coffee-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
