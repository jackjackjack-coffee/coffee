import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

export function EmptyState({ icon, text, action }: { icon?: ReactNode; text: string; action?: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-coffee-200 bg-white/50 px-6 py-12 text-center"
    >
      {icon && (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-coffee-100 text-3xl text-coffee-500">
          {icon}
        </div>
      )}
      <p className="max-w-xs text-sm text-coffee-600">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}
