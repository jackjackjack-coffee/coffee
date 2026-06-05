import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import type { Drink, Ingredient } from '../../data/types';
import { cafeDrinkEconomics, indexById, ingredientUnitCost } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { NumberField, SelectField } from '../../components/ui/fields';
import { useActiveMenu } from './useMenus';

export function WhatIfPanel() {
  const t = useT();
  const fmt = useFormat();
  const menu = useActiveMenu();

  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('cafe').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('cafe').toArray(), [], [] as Ingredient[]);

  const [ingId, setIngId] = useState('');
  const [newPrice, setNewPrice] = useState<number | undefined>(undefined);

  const selected = ingredients.find((i) => i.id === ingId) ?? ingredients[0];
  const baseById = useMemo(() => indexById(ingredients), [ingredients]);

  const simById = useMemo(() => {
    if (!selected) return baseById;
    const map = new Map(baseById);
    map.set(selected.id, { ...selected, purchasePrice: newPrice ?? selected.purchasePrice });
    return map;
  }, [baseById, selected, newPrice]);

  const affected = useMemo(
    () => (selected ? drinks.filter((d) => d.items.some((it) => it.ingredientId === selected.id)) : []),
    [drinks, selected],
  );

  if (!menu || ingredients.length === 0) {
    return (
      <div>
        <SectionTitle title={t('whatif.title')} subtitle={t('whatif.intro')} />
        <EmptyState icon="🧪" text={t('ing.empty')} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle title={t('whatif.title')} subtitle={t('whatif.intro')} />

      <Card className="grid grid-cols-2 gap-2">
        <SelectField
          label={t('whatif.pick')}
          value={selected?.id ?? ''}
          onChange={(v) => {
            setIngId(v);
            setNewPrice(undefined);
          }}
          options={ingredients.map((i) => ({ value: i.id, label: i.name }))}
        />
        <NumberField
          label={t('whatif.newPrice')}
          value={newPrice ?? selected?.purchasePrice}
          onChange={(v) => setNewPrice(v ?? 0)}
          min={0}
          hint={selected ? `${fmt.unit(ingredientUnitCost(selected))} → ${fmt.unit(ingredientUnitCost(simById.get(selected.id)))}` : undefined}
        />
      </Card>

      {affected.length === 0 ? (
        <EmptyState icon="🤷" text={t('whatif.noneAffected')} />
      ) : (
        <Card className="p-0">
          <div className="grid grid-cols-12 gap-2 border-b border-white/10 px-3 py-2 text-[11px] font-semibold uppercase text-coffee-400">
            <div className="col-span-4">{t('whatif.affected')}</div>
            <div className="col-span-3 text-right">{t('whatif.before')}</div>
            <div className="col-span-3 text-right">{t('whatif.after')}</div>
            <div className="col-span-2 text-right">Δ</div>
          </div>
          {affected.map((d) => {
            const before = cafeDrinkEconomics(d, menu, baseById);
            const after = cafeDrinkEconomics(d, menu, simById);
            const delta = after.margin - before.margin;
            return (
              <div key={d.id} className="grid grid-cols-12 items-center gap-2 border-b border-white/10 px-3 py-2 last:border-0">
                <div className="col-span-4 min-w-0 truncate text-sm font-medium text-coffee-900">{d.name}</div>
                <div className="col-span-3 text-right text-sm text-coffee-500 tnum">
                  {fmt.pct(before.margin)}
                  <div className="text-[10px] text-coffee-400">{fmt.money(before.cogs)}</div>
                </div>
                <div className={`col-span-3 text-right text-sm font-semibold tnum ${after.isLowMargin ? 'text-rose-400' : 'text-coffee-900'}`}>
                  {fmt.pct(after.margin)}
                  <div className="text-[10px] text-coffee-400">{fmt.money(after.cogs)}</div>
                </div>
                <div className={`col-span-2 text-right text-sm font-bold tnum ${delta < 0 ? 'text-rose-400' : 'text-mint'}`}>
                  {delta >= 0 ? '+' : ''}
                  {fmt.pct(delta, 1)}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
