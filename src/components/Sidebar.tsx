import { useId } from 'react';
import { motion } from 'framer-motion';
import { Lock, Settings } from 'lucide-react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useTier } from '../lib/hooks';
import { indicatorSpring } from '../lib/motion';
import { hasFeature } from '../license/gate';
import { useAppStore } from '../store/useAppStore';
import { CURRENCY_SYMBOL } from '../lib/format';
import type { Currency, Language } from '../data/types';
import { CAFE_SECTIONS, HOME_SECTIONS } from './sections';
import { SECTION_ICON } from './icons';
import { ModeSwitcher } from './ModeSwitcher';
import { BrandMark } from './BrandMark';

const CURRENCIES: Currency[] = ['KRW', 'USD', 'EUR'];

export function Sidebar() {
  const t = useT();
  const tier = useTier();
  const mode = useAppStore((s) => s.mode);
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);
  const homeSection = useAppStore((s) => s.homeSection);
  const cafeSection = useAppStore((s) => s.cafeSection);
  const setHomeSection = useAppStore((s) => s.setHomeSection);
  const setCafeSection = useAppStore((s) => s.setCafeSection);
  const pill = `navpill-${useId()}`;

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
        language === l ? 'text-white' : 'text-coffee-400 hover:text-coffee-200',
      )}
    >
      {label}
    </button>
  );

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-espresso text-coffee-100 lg:flex">
      <div className="flex items-center gap-2.5 px-5 pb-3 pt-6">
        <span className="text-caramel">
          <BrandMark size={30} />
        </span>
        <span className="font-display text-xl font-bold text-white">{t('app.name')}</span>
      </div>
      <p className="px-5 pb-4 text-xs leading-relaxed text-coffee-400">{t('app.tagline')}</p>

      <div className="px-3 pb-3">
        <ModeSwitcher />
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {sections.map((s) => {
          const locked = s.feature ? !hasFeature(tier, s.feature) : false;
          const isActive = active === s.id;
          const Icon = SECTION_ICON[s.id];
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => setActive(s.id as never)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'sidebar-link w-full text-left',
                isActive ? 'text-espresso' : 'text-coffee-200 hover:bg-white/5 hover:text-white',
              )}
            >
              {isActive && (
                <motion.span
                  layoutId={pill}
                  transition={indicatorSpring}
                  className="absolute inset-0 rounded-xl bg-caramel shadow-sm"
                />
              )}
              <span className="relative z-10 flex w-full items-center gap-3">
                {Icon && <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />}
                <span className="flex-1">{t(s.tKey)}</span>
                {locked && <Lock className="h-3.5 w-3.5 opacity-70" />}
              </span>
            </button>
          );
        })}
      </nav>

      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
        <div className="flex items-center rounded-lg border border-white/15 bg-white/5">
          {langBtn('ko', 'KO')}
          <span className="text-white/20">|</span>
          {langBtn('en', 'EN')}
        </div>
        <select
          aria-label={t('set.currency')}
          value={currency}
          onChange={(e) => setCurrency(e.target.value as Currency)}
          className="rounded-lg border border-white/15 bg-white/5 px-2 py-1 text-xs font-semibold text-coffee-100"
        >
          {CURRENCIES.map((c) => (
            <option key={c} value={c} className="text-coffee-900">
              {CURRENCY_SYMBOL[c]} {c}
            </option>
          ))}
        </select>
        <button
          type="button"
          aria-label={t('set.title')}
          onClick={openSettings}
          className="flex items-center rounded-lg p-1.5 text-coffee-300 transition-colors hover:bg-white/10 hover:text-white"
        >
          <Settings className="h-4 w-4" strokeWidth={2.2} />
        </button>
      </div>
    </aside>
  );
}
