import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useAppStore } from '../store/useAppStore';
import { CURRENCY_SYMBOL } from '../lib/format';
import type { Currency, Language } from '../data/types';
import { ModeSwitcher } from './ModeSwitcher';

const CURRENCIES: Currency[] = ['KRW', 'USD', 'EUR'];

export function Header() {
  const t = useT();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const mode = useAppStore((s) => s.mode);
  const setHomeSection = useAppStore((s) => s.setHomeSection);
  const setCafeSection = useAppStore((s) => s.setCafeSection);

  const openSettings = () => (mode === 'home' ? setHomeSection('settings') : setCafeSection('settings'));

  const langBtn = (l: Language, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(l)}
      className={cn(
        'px-2 py-1 text-xs font-semibold',
        language === l ? 'text-coffee-900' : 'text-coffee-400 hover:text-coffee-600',
      )}
    >
      {label}
    </button>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-coffee-100 bg-cream/90 backdrop-blur">
      <div className="mx-auto max-w-3xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xl">☕</span>
            <span className="truncate text-base font-bold text-coffee-900">{t('app.name')}</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="flex items-center rounded-lg border border-coffee-200 bg-white">
              {langBtn('ko', 'KO')}
              <span className="text-coffee-200">|</span>
              {langBtn('en', 'EN')}
            </div>
            <select
              aria-label={t('set.currency')}
              value={currency}
              onChange={(e) => setCurrency(e.target.value as Currency)}
              className="rounded-lg border border-coffee-200 bg-white px-2 py-1 text-xs font-semibold text-coffee-700"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {CURRENCY_SYMBOL[c]} {c}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label={t('set.title')}
              onClick={openSettings}
              className="btn-ghost px-2 py-1"
            >
              ⚙️
            </button>
          </div>
        </div>
        <p className="mt-1 hidden text-xs text-coffee-500 sm:block">{t('app.tagline')}</p>
        <div className="mt-3">
          <ModeSwitcher />
        </div>
      </div>
    </header>
  );
}
