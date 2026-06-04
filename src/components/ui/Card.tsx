import type { HTMLAttributes, ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { cn } from '../../lib/cn';
import { fadeUp } from '../../lib/motion';

export function Card({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('card', className)} {...rest} />;
}

/**
 * Card that reveals with the shared `fadeUp` variant. Drop these inside a
 * parent using `staggerContainer` (initial="hidden" animate="show") and they
 * cascade in. Pass `interactive` for a hover lift.
 */
export function MotionCard({
  className,
  interactive,
  ...rest
}: HTMLMotionProps<'div'> & { interactive?: boolean }) {
  return (
    <motion.div
      variants={fadeUp}
      className={cn('card', interactive && 'card-interactive', className)}
      {...rest}
    />
  );
}

export function SectionTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold text-coffee-900 sm:text-2xl">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-coffee-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
