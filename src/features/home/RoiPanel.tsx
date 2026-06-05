import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { db } from '../../data/db';
import type { Drink, Equipment, Ingredient } from '../../data/types';
import { breakeven, roiCurve, suggestRoiMonths } from '../../engine/breakeven';
import { homeCupCost, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { Card, SectionTitle } from '../../components/ui/Card';
import { NumberField, SelectField } from '../../components/ui/fields';
import { Stat } from '../../components/ui/Stat';
import { useHomeSettings } from './HomeSettingsCard';

export function RoiPanel() {
  const t = useT();
  const fmt = useFormat();
  const settings = useHomeSettings();

  const equipment = useLiveQuery(() => db.equipment.toArray(), [], [] as Equipment[]);
  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('home').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('home').toArray(), [], [] as Ingredient[]);
  const ingById = useMemo(() => indexById(ingredients), [ingredients]);

  const registeredTotal = equipment.reduce((s, e) => s + e.price, 0);
  const [price, setPrice] = useState<number | undefined>(undefined);
  const [recipeId, setRecipeId] = useState('');
  const equipmentPrice = price ?? registeredTotal;

  const recipe = drinks.find((d) => d.id === recipeId) ?? drinks[0];
  const homeCup = recipe ? homeCupCost(recipe, ingById) : 0;

  const input = {
    equipmentPrice,
    cafePrice: settings.avgCafeCupPrice,
    homeConsumablePerCup: homeCup,
    cupsPerDay: Math.max(0.1, settings.cupsPerDay),
  };
  const result = breakeven(input);
  const months = suggestRoiMonths(result);
  const curve = roiCurve(input, { months }).map((p) => ({ month: p.month, net: Math.round(p.net) }));

  return (
    <div className="space-y-4">
      <SectionTitle title={t('roi.title')} subtitle={t('roi.intro')} />

      <Card>
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label={t('roi.equipmentPrice')}
            value={equipmentPrice}
            onChange={(v) => setPrice(v ?? 0)}
            min={0}
          />
          {drinks.length > 0 && (
            <SelectField
              label={t('roi.pickDrink')}
              value={recipe?.id ?? ''}
              onChange={setRecipeId}
              options={drinks.map((d) => ({ value: d.id, label: d.name }))}
            />
          )}
        </div>
      </Card>

      {result.neverBreaksEven ? (
        <Card className="bg-gold/10 text-gold">{t('roi.never')}</Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t('roi.savePerCup')} amount={result.perCupSaving} format={fmt.money} accent="good" />
            <Stat label={t('roi.breakevenCups')} amount={Math.ceil(result.breakevenCups)} format={fmt.num} />
            <Stat
              label={t('roi.breakevenTime')}
              value={t('roi.months', { n: fmt.num(result.breakevenMonths, 1) })}
              sub={t('roi.days', { n: fmt.num(Math.ceil(result.breakevenDays)) })}
            />
            <Stat label={t('roi.annualAfter')} amount={result.annualSavingsAfterBreakeven} format={fmt.money} accent="good" />
          </div>

          <Card>
            <div className="mb-2 text-sm font-medium text-coffee-700">{t('roi.chart')}</div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={curve} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <defs>
                    <linearGradient id="roiFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.55} />
                      <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2350" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#a99bd0' }}
                    tickFormatter={(m) => `${m}m`}
                    stroke="#3a3170"
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#a99bd0' }}
                    width={48}
                    tickFormatter={(v) => fmt.num(v / 1000) + 'k'}
                    stroke="#3a3170"
                  />
                  <Tooltip
                    contentStyle={{ background: '#1b1233', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f3eefc' }}
                    labelStyle={{ color: '#c4b5fd' }}
                    formatter={(v: number) => [fmt.money(v), t('roi.netSavings')]}
                    labelFormatter={(m) => t('roi.months', { n: m as number })}
                  />
                  <ReferenceLine y={0} stroke="#8b7cb8" strokeDasharray="4 4" />
                  <Area type="monotone" dataKey="net" stroke="#c4b5fd" strokeWidth={2.5} fill="url(#roiFill)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
