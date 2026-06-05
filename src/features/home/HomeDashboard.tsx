import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import type { Drink, Ingredient, SpendEntry } from '../../data/types';
import { savingsPerCup } from '../../engine/breakeven';
import { homeCupCost, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { Card, SectionTitle } from '../../components/ui/Card';
import { Stat } from '../../components/ui/Stat';
import { CountUp } from '../../components/ui/CountUp';
import { HomeSettingsCard, useHomeSettings } from './HomeSettingsCard';

const DAYS_PER_YEAR = 365;

export function HomeDashboard() {
  const t = useT();
  const fmt = useFormat();
  const settings = useHomeSettings();

  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('home').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('home').toArray(), [], [] as Ingredient[]);
  const spend = useLiveQuery(() => db.spend.toArray(), [], [] as SpendEntry[]);
  const ingById = useMemo(() => indexById(ingredients), [ingredients]);

  const avgHomeCup = useMemo(() => {
    if (drinks.length === 0) return 0;
    const total = drinks.reduce((s, d) => s + homeCupCost(d, ingById), 0);
    return total / drinks.length;
  }, [drinks, ingById]);

  const year = new Date().getFullYear().toString();
  const thisYearSpend = spend.filter((s) => s.date.startsWith(year));
  const yearSpend = thisYearSpend.reduce((s, e) => s + e.amount, 0);
  const cafeSpend = thisYearSpend.filter((s) => s.type === 'cafe').reduce((s, e) => s + e.amount, 0);
  const homeSpend = yearSpend - cafeSpend;

  const perCupSaving = Math.max(0, savingsPerCup(settings.avgCafeCupPrice, avgHomeCup));
  const annualSaving = perCupSaving * settings.cupsPerDay * DAYS_PER_YEAR;
  const cafeAnnual = settings.avgCafeCupPrice * settings.cupsPerDay * DAYS_PER_YEAR;

  const homePct = yearSpend > 0 ? Math.round((homeSpend / yearSpend) * 100) : 0;

  return (
    <div className="space-y-4">
      <SectionTitle title={t('home.dash.title')} />

      <Card className="bg-gradient-to-br from-violet-600/40 to-indigo-900/40 text-white">
        <p className="text-sm leading-relaxed text-coffee-800">
          {yearSpend > 0
            ? t('home.dash.hook', { spent: fmt.money(yearSpend), saved: fmt.money(annualSaving) })
            : t('home.dash.projalc', { cups: fmt.num(settings.cupsPerDay), amount: fmt.money(cafeAnnual) })}
        </p>
        <CountUp value={annualSaving} format={fmt.money} className="hero-number mt-3 block text-4xl" />
        <div className="text-xs text-coffee-600">{t('home.dash.savedHome')} · {t('common.perYear')}</div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t('home.dash.perCupHome')} amount={avgHomeCup} format={fmt.money} />
        <Stat label={t('home.dash.perCupCafe')} amount={settings.avgCafeCupPrice} format={fmt.money} />
        <Stat label={t('roi.savePerCup')} amount={perCupSaving} format={fmt.money} accent={perCupSaving > 0 ? 'good' : 'warn'} />
        <Stat label={t('home.dash.yearSpend')} amount={yearSpend} format={fmt.money} sub={yearSpend === 0 ? t('home.dash.noData') : undefined} />
      </div>

      {yearSpend > 0 && (
        <Card>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-coffee-700">{t('home.dash.split')}</span>
            <span className="text-coffee-500 tnum">
              {t('mode.home')} {homePct}% · {t('mode.cafe')} {100 - homePct}%
            </span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-white/5">
            <div className="bg-violet-500" style={{ width: `${homePct}%` }} />
            <div className="bg-gold" style={{ width: `${100 - homePct}%` }} />
          </div>
        </Card>
      )}

      <div>
        <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-coffee-400">
          {t('nav.home.settings')}
        </div>
        <HomeSettingsCard />
      </div>
    </div>
  );
}
