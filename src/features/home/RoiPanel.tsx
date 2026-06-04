import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  CartesianGrid,
  Line,
  LineChart,
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
        <Card className="bg-amber-50 text-amber-800">{t('roi.never')}</Card>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t('roi.savePerCup')} value={fmt.money(result.perCupSaving)} accent="good" />
            <Stat label={t('roi.breakevenCups')} value={fmt.num(Math.ceil(result.breakevenCups))} />
            <Stat
              label={t('roi.breakevenTime')}
              value={t('roi.months', { n: fmt.num(result.breakevenMonths, 1) })}
              sub={t('roi.days', { n: fmt.num(Math.ceil(result.breakevenDays)) })}
            />
            <Stat label={t('roi.annualAfter')} value={fmt.money(result.annualSavingsAfterBreakeven)} accent="good" />
          </div>

          <Card>
            <div className="mb-2 text-sm font-medium text-coffee-700">{t('roi.chart')}</div>
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={curve} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaddcf" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11 }}
                    tickFormatter={(m) => `${m}m`}
                    stroke="#a98a6d"
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    width={48}
                    tickFormatter={(v) => fmt.num(v / 1000) + 'k'}
                    stroke="#a98a6d"
                  />
                  <Tooltip
                    formatter={(v: number) => [fmt.money(v), t('roi.netSavings')]}
                    labelFormatter={(m) => t('roi.months', { n: m as number })}
                  />
                  <ReferenceLine y={0} stroke="#965938" strokeDasharray="4 4" />
                  <Line type="monotone" dataKey="net" stroke="#7c4730" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
