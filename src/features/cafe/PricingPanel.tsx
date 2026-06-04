import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { upsertDrink } from '../../data/repo';
import type { Drink, Ingredient } from '../../data/types';
import { cafeDrinkEconomics, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { NumberInput } from '../../components/ui/fields';
import { MenuPricingControls } from './MenuPricingControls';
import { useActiveMenu } from './useMenus';

function setSellPrice(drink: Drink, price: number | undefined): void {
  void upsertDrink({ ...drink, sellPrice: price && price > 0 ? price : undefined });
}

export function PricingPanel() {
  const t = useT();
  const fmt = useFormat();
  const menu = useActiveMenu();

  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('cafe').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('cafe').toArray(), [], [] as Ingredient[]);
  const ingById = useMemo(() => indexById(ingredients), [ingredients]);

  if (!menu) return null;

  return (
    <div className="space-y-4">
      <SectionTitle title={t('price.title')} subtitle={menu.name} />
      <MenuPricingControls menu={menu} />

      {drinks.length === 0 ? (
        <EmptyState icon="💲" text={t('drink.empty')} />
      ) : (
        <Card className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b border-coffee-100 px-3 py-2 text-[11px] font-semibold uppercase text-coffee-400">
            <div className="col-span-4">{t('common.name')}</div>
            <div className="col-span-2 text-right">{t('drink.cogs')}</div>
            <div className="col-span-2 text-right">{t('drink.suggested')}</div>
            <div className="col-span-2 text-right">{t('drink.sellPrice')}</div>
            <div className="col-span-2 text-right">{t('drink.margin')}</div>
          </div>
          {drinks.map((d) => {
            const e = cafeDrinkEconomics(d, menu, ingById);
            return (
              <div key={d.id} className="grid grid-cols-12 items-center gap-2 border-b border-coffee-50 px-3 py-2 last:border-0">
                <div className="col-span-4 min-w-0">
                  <div className="truncate text-sm font-medium text-coffee-900">{d.name}</div>
                  <div className="text-[10px] text-coffee-400">
                    {t('drink.costRatio')} {fmt.pct(e.costRatio)}
                  </div>
                </div>
                <div className="col-span-2 text-right text-sm text-coffee-600 tnum">{fmt.money(e.cogs)}</div>
                <div className="col-span-2 text-right text-sm text-coffee-500 tnum">{fmt.money(e.suggestedPrice)}</div>
                <div className="col-span-2">
                  <NumberInput
                    value={d.sellPrice}
                    onChange={(v) => setSellPrice(d, v ?? undefined)}
                    placeholder={fmt.num(Math.round(e.suggestedPrice))}
                    min={0}
                  />
                </div>
                <div
                  className={`col-span-2 text-right text-sm font-bold tnum ${
                    e.isLowMargin ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {fmt.pct(e.margin)}
                  {e.isLowMargin && <span title={t('drink.lowMargin')}> ⚠</span>}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
