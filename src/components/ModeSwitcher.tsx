import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useAppStore } from '../store/useAppStore';
import type { Mode } from '../data/types';

export function ModeSwitcher() {
  const t = useT();
  const mode = useAppStore((s) => s.mode);
  const setMode = useAppStore((s) => s.setMode);

  const tab = (m: Mode, label: string, sub: string, emoji: string) => (
    <button
      key={m}
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={cn(
        'flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
        mode === m ? 'bg-white text-coffee-900 shadow-sm' : 'text-coffee-600 hover:text-coffee-800',
      )}
    >
      <span className="text-base">{emoji}</span>
      <span className="flex flex-col items-start leading-tight">
        <span>{label}</span>
        <span className="text-[10px] font-normal opacity-70">{sub}</span>
      </span>
    </button>
  );

  return (
    <div className="flex gap-1 rounded-2xl bg-coffee-100 p-1">
      {tab('home', t('mode.home'), t('mode.home.sub'), '🏠')}
      {tab('cafe', t('mode.cafe'), t('mode.cafe.sub'), '🏪')}
    </div>
  );
}
