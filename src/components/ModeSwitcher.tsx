import { useId } from 'react';
import { motion } from 'framer-motion';
import { Home, Store, type LucideIcon } from 'lucide-react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { indicatorSpring } from '../lib/motion';
import { useAppStore } from '../store/useAppStore';
import type { Mode } from '../data/types';

export function ModeSwitcher() {
  const t = useT();
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);
  // Unique per instance so the sidebar + mobile copies don't share a layoutId.
  const pill = `modepill-${useId()}`;

  const tab = (m: Mode, label: string, sub: string, Icon: LucideIcon) => {
    const active = mode === m;
    return (
      <button
        key={m}
        type="button"
        onClick={() => setMode(m)}
        aria-pressed={active}
        className={cn(
          'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
          active ? 'text-coffee-900' : 'text-coffee-500 hover:text-coffee-800',
        )}
      >
        {active && (
          <motion.span
            layoutId={pill}
            transition={indicatorSpring}
            className="absolute inset-0 rounded-xl bg-white shadow-sm"
          />
        )}
        <span className="relative z-10 flex items-center gap-2">
          <Icon className="h-4 w-4" strokeWidth={2.2} />
          <span className="flex flex-col items-start leading-tight">
            <span>{label}</span>
            <span className="text-[10px] font-normal opacity-70">{sub}</span>
          </span>
        </span>
      </button>
    );
  };

  return (
    <div className="flex gap-1 rounded-2xl bg-coffee-100 p-1">
      {tab('home', t('mode.home'), t('mode.home.sub'), Home)}
      {tab('cafe', t('mode.cafe'), t('mode.cafe.sub'), Store)}
    </div>
  );
}
