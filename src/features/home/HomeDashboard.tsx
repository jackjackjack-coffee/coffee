import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { Coffee, Home, PiggyBank, Store, TrendingUp, Wallet } from 'lucide-react';
import { db } from '../../data/db';
import type { Drink, Ingredient, SpendEntry } from '../../data/types';
import { savingsPerCup } from '../../engine/breakeven';
import { homeCupCost, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { fadeUp, popIn, staggerContainer } from '../../lib/motion';
import { Card, MotionCard, SectionTitle } from '../../components/ui/Card';
import { Stat } from '../../components/ui/Stat';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
import { BrandMark } from '../../components/BrandMark';
import { HomeSettingsCard, useHomeSettings } from './HomeSettingsCard';

const DAYS_PER_YEAR = 365;
const HOME_COLOR = '#7c4730'; // coffee-700
const CAFE_COLOR = '#c98a4b'; // caramel

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
  const splitData = [
    { name: t('mode.home'), value: homeSpend, color: HOME_COLOR },
    { name: t('mode.cafe'), value: cafeSpend, color: CAFE_COLOR },
  ];

  // Projection used when there's no logged spend yet.
  const homeAnnual = avgHomeCup * settings.cupsPerDay * DAYS_PER_YEAR;
  const projMax = Math.max(cafeAnnual, homeAnnual, 1);

  return (
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <SectionTitle title={t('home.dash.title')} />

      <motion.div variants={popIn}>
        <Card className="relative overflow-hidden bg-gradient-to-br from-coffee-700 via-coffee-800 to-coffee-900 text-white">
          {/* decorative oversized brand mark */}
          <BrandMark size={180} className="pointer-events-none absolute -right-8 -top-10 text-white/5" />
          <div className="relative">
            <div className="flex items-center gap-2 text-coffee-200">
              <PiggyBank className="h-4 w-4" strokeWidth={2.2} />
              <span className="text-xs font-medium uppercase tracking-wide">
                {t('home.dash.savedHome')} · {t('common.perYear')}
              </span>
            </div>
            <div className="mt-2 font-display text-4xl font-bold tnum sm:text-5xl">
              <AnimatedNumber value={annualSaving} format={fmt.money} />
            </div>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-coffee-100">
              {yearSpend > 0
                ? t('home.dash.hook', { spent: fmt.money(yearSpend), saved: fmt.money(annualSaving) })
                : t('home.dash.projalc', { cups: fmt.num(settings.cupsPerDay), amount: fmt.money(cafeAnnual) })}
            </p>
          </div>
        </Card>
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat
          icon={Coffee}
          label={t('home.dash.perCupHome')}
          value={<AnimatedNumber value={avgHomeCup} format={fmt.money} />}
        />
        <Stat
          icon={Store}
          label={t('home.dash.perCupCafe')}
          value={<AnimatedNumber value={settings.avgCafeCupPrice} format={fmt.money} />}
        />
        <Stat
          icon={TrendingUp}
          label={t('roi.savePerCup')}
          value={<AnimatedNumber value={perCupSaving} format={fmt.money} />}
          accent={perCupSaving > 0 ? 'good' : 'warn'}
        />
        <Stat
          icon={Wallet}
          label={t('home.dash.yearSpend')}
          value={<AnimatedNumber value={yearSpend} format={fmt.money} />}
          sub={yearSpend === 0 ? t('home.dash.noData') : undefined}
        />
      </motion.div>

      <div className="grid gap-4 lg:grid-cols-2 lg:items-start">
        <motion.div variants={fadeUp}>
          <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-coffee-400">
            {t('nav.home.settings')}
          </div>
          <HomeSettingsCard />
        </motion.div>

        {yearSpend > 0 ? (
          <MotionCard>
            <div className="mb-2 flex items-center gap-2 text-sm font-medium text-coffee-800">
              <Home className="h-4 w-4 text-coffee-500" strokeWidth={2.2} />
              {t('home.dash.split')}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative h-36 w-36 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={splitData}
                      dataKey="value"
                      innerRadius={42}
                      outerRadius={64}
                      paddingAngle={2}
                      startAngle={90}
                      endAngle={-270}
                      stroke="none"
                    >
                      {splitData.map((d) => (
                        <Cell key={d.name} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-lg font-bold text-coffee-900 tnum">{homePct}%</span>
                  <span className="text-[10px] text-coffee-400">{t('mode.home')}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1 space-y-2 text-sm">
                <LegendRow color={HOME_COLOR} label={t('mode.home')} value={fmt.money(homeSpend)} />
                <LegendRow color={CAFE_COLOR} label={t('mode.cafe')} value={fmt.money(cafeSpend)} />
                <div className="border-t border-coffee-100 pt-2 text-xs text-coffee-500">
                  {t('common.perYear')} · {fmt.money(yearSpend)}
                </div>
              </div>
            </div>
          </MotionCard>
        ) : (
          <MotionCard>
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-coffee-800">
              <TrendingUp className="h-4 w-4 text-coffee-500" strokeWidth={2.2} />
              {t('home.dash.projTitle')}
            </div>
            <div className="space-y-3">
              <ProjectionBar
                label={t('mode.cafe')}
                value={fmt.money(cafeAnnual)}
                pct={(cafeAnnual / projMax) * 100}
                color={CAFE_COLOR}
              />
              <ProjectionBar
                label={t('mode.home')}
                value={fmt.money(homeAnnual)}
                pct={(homeAnnual / projMax) * 100}
                color={HOME_COLOR}
              />
            </div>
            <p className="mt-3 border-t border-coffee-100 pt-2 text-xs text-coffee-500">
              {t('home.dash.noData')}
            </p>
          </MotionCard>
        )}
      </div>
    </motion.div>
  );
}

function ProjectionBar({ label, value, pct, color }: { label: string; value: string; pct: number; color: string }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-coffee-700">{label}</span>
        <span className="font-semibold text-coffee-900 tnum">{value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-coffee-100">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(2, Math.min(100, pct))}%` }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        />
      </div>
    </div>
  );
}

function LegendRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-2">
      <span className="flex items-center gap-2 text-coffee-700">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
        {label}
      </span>
      <span className="font-semibold text-coffee-900 tnum">{value}</span>
    </div>
  );
}
