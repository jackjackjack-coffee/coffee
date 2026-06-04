import type { ReactNode } from 'react';

export function EmptyState({ icon, text, action }: { icon?: ReactNode; text: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-coffee-200 px-6 py-10 text-center">
      {icon && <div className="mb-2 text-3xl">{icon}</div>}
      <p className="max-w-xs text-sm text-coffee-600">{text}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
