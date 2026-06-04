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

      <Card className="bg-gradient-to-br from-coffee-700 to-coffee-900 text-white">
        <p className="text-sm leading-relaxed text-coffee-100">
          {yearSpend > 0
            ? t('home.dash.hook', { spent: fmt.money(yearSpend), saved: fmt.money(annualSaving) })
            : t('home.dash.projalc', { cups: fmt.num(settings.cupsPerDay), amount: fmt.money(cafeAnnual) })}
        </p>
        <div className="mt-3 text-3xl font-bold tnum">{fmt.money(annualSaving)}</div>
        <div className="text-xs text-coffee-200">{t('home.dash.savedHome')} · {t('common.perYear')}</div>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t('home.dash.perCupHome')} value={fmt.money(avgHomeCup)} />
        <Stat label={t('home.dash.perCupCafe')} value={fmt.money(settings.avgCafeCupPrice)} />
        <Stat label={t('roi.savePerCup')} value={fmt.money(perCupSaving)} accent={perCupSaving > 0 ? 'good' : 'warn'} />
        <Stat label={t('home.dash.yearSpend')} value={fmt.money(yearSpend)} sub={yearSpend === 0 ? t('home.dash.noData') : undefined} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <div>
          <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-coffee-400">
            {t('nav.home.settings')}
          </div>
          <HomeSettingsCard />
        </div>

        {yearSpend > 0 && (
          <Card>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-medium text-coffee-700">{t('home.dash.split')}</span>
              <span className="text-coffee-500 tnum">
                {t('mode.home')} {homePct}% · {t('mode.cafe')} {100 - homePct}%
              </span>
            </div>
            <div className="flex h-3 overflow-hidden rounded-full bg-coffee-100">
              <div className="bg-coffee-600" style={{ width: `${homePct}%` }} />
              <div className="bg-amber-400" style={{ width: `${100 - homePct}%` }} />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
