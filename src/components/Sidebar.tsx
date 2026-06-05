import { useState, type SVGProps } from 'react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useTier } from '../lib/hooks';
import { hasFeature } from '../license/gate';
import { useAppStore } from '../store/useAppStore';
import { CURRENCY_SYMBOL } from '../lib/format';
import type { Currency, Language } from '../data/types';
import { CAFE_SECTIONS, HOME_SECTIONS } from './sections';
import { DEFAULT_ICON, SECTION_ICON } from './sectionIcons';
import { ModeSwitcher } from './ModeSwitcher';

const CURRENCIES: Currency[] = ['KRW', 'USD', 'EUR'];

/** Celestial eye-in-orbit emblem echoing the reference brand mark. */
function Emblem(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.4" opacity="0.5" />
      <path
        d="M4 12c2.2-3 5-4.5 8-4.5S17.8 9 20 12c-2.2 3-5 4.5-8 4.5S6.2 15 4 12Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <circle cx="12" cy="12" r="2.1" fill="currentColor" />
      <path d="M18.5 4.5l.6 1.6 1.6.6-1.6.6-.6 1.6-.6-1.6-1.6-.6 1.6-.6.6-1.6Z" fill="currentColor" />
    </svg>
  );
}

function Hamburger(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" aria-hidden="true" {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

function Brand({ compact }: { compact?: boolean }) {
  const t = useT();
  return (
    <div className="flex items-center gap-2.5">
      <Emblem className={cn('shrink-0 text-starlit', compact ? 'h-7 w-7' : 'h-9 w-9')} />
      <div className="leading-tight">
        <div className="text-sm font-bold uppercase tracking-[0.16em] text-coffee-900">{t('app.name')}</div>
        {!compact && (
          <div className="text-[10px] uppercase tracking-[0.18em] text-coffee-400">{t('brand.line2')}</div>
        )}
      </div>
    </div>
  );
}

export function Sidebar() {
  const t = useT();
  const tier = useTier();
  const mode = useAppStore((s) => s.mode);
  const homeSection = useAppStore((s) => s.homeSection);
  const cafeSection = useAppStore((s) => s.cafeSection);
  const setHomeSection = useAppStore((s) => s.setHomeSection);
  const setCafeSection = useAppStore((s) => s.setCafeSection);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);

  const [open, setOpen] = useState(false);

  const sections = mode === 'home' ? HOME_SECTIONS : CAFE_SECTIONS;
  const active = mode === 'home' ? homeSection : cafeSection;
  const setActive = mode === 'home' ? setHomeSection : setCafeSection;
  const openSettings = () => (mode === 'home' ? setHomeSection('settings') : setCafeSection('settings'));

  const langBtn = (l: Language, label: string) => (
    <button
      type="button"
      onClick={() => setLanguage(l)}
      className={cn(
        'px-2 py-1 text-xs font-semibold transition-colors',
        language === l ? 'text-coffee-900' : 'text-coffee-400 hover:text-coffee-700',
      )}
    >
      {label}
    </button>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="sticky top-0 z-30 flex items-center justify-between gap-2 border-b border-white/10 bg-night/70 px-4 py-3 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-label="menu"
          onClick={() => setOpen(true)}
          className="rounded-lg p-1.5 text-coffee-700 hover:bg-white/10"
        >
          <Hamburger className="h-5 w-5" />
        </button>
        <Brand compact />
        <button
          type="button"
          aria-label={t('set.title')}
          onClick={openSettings}
          className="rounded-lg p-1.5 text-coffee-700 hover:bg-white/10"
        >
          ⚙️
        </button>
      </div>

      {/* Drawer scrim (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-night/80 backdrop-blur-sm lg:hidden"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar (fixed on desktop, slide-in drawer on mobile) */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-4 border-r border-white/10 bg-night/70 px-4 py-5 backdrop-blur-xl transition-transform duration-200 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
        )}
      >
        <Brand />

        <ModeSwitcher />

        <nav className="-mx-1 flex flex-1 flex-col gap-1 overflow-y-auto px-1">
          {sections.map((s) => {
            const locked = s.feature ? !hasFeature(tier, s.feature) : false;
            const isActive = active === s.id;
            const Icon = SECTION_ICON[s.id] ?? DEFAULT_ICON;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setActive(s.id as never);
                  setOpen(false);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'nav-item-active' : 'text-coffee-500 hover:bg-white/5 hover:text-coffee-900',
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className="truncate">{t(s.tKey)}</span>
                {locked && <span className="ml-auto text-[10px] opacity-80">🔒</span>}
              </button>
            );
          })}
        </nav>

        {/* Locale + settings controls */}
        <div className="flex items-center gap-1.5 border-t border-white/10 pt-4">
          <div className="flex items-center rounded-lg border border-white/15 bg-white/5">
            {langBtn('ko', 'KO')}
            <span className="text-white/20">|</span>
            {langBtn('en', 'EN')}
          </div>
          <select
            aria-label={t('set.currency')}
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-coffee-700"
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c} className="bg-plum text-coffee-50">
                {CURRENCY_SYMBOL[c]} {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            aria-label={t('set.title')}
            onClick={openSettings}
            className="ml-auto rounded-lg p-1.5 text-coffee-700 hover:bg-white/10"
          >
            ⚙️
          </button>
        </div>
      </aside>
    </>
  );
}
