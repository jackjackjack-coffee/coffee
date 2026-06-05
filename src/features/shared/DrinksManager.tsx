import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { remove, upsertDrink } from '../../data/repo';
import { buildSeed, DEFAULT_WASTE_PCT } from '../../data/presets';
import type { Drink, DrinkItem, Ingredient, Menu, Mode } from '../../data/types';
import { baseUnit, sameDimension, type Unit } from '../../engine/units';
import { cafeDrinkEconomics, homeCupCost, indexById, resolveLines } from '../../store/selectors';
import { useFormat, useTier } from '../../lib/hooks';
import { useAppStore } from '../../store/useAppStore';
import { useT } from '../../i18n';
import { canSaveDrink, FREE_DRINK_LIMIT } from '../../license/gate';
import { UNITS, unitKey } from '../../lib/options';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { NumberField, NumberInput, SelectField, TextField } from '../../components/ui/fields';
import { PaywallNote, ProBadge } from '../../components/ui/Pro';

export function DrinksManager({ mode, activeMenu }: { mode: Mode; activeMenu?: Menu }) {
  const t = useT();
  const fmt = useFormat();
  const tier = useTier();
  const language = useAppStore((s) => s.language);
  const [editing, setEditing] = useState<Drink | 'new' | null>(null);
  const [showLimit, setShowLimit] = useState(false);

  const drinks = useLiveQuery(
    () => db.drinks.where('mode').equals(mode).toArray(),
    [mode],
    [] as Drink[],
  );
  const ingredients = useLiveQuery(
    () => db.ingredients.where('mode').equals(mode).toArray(),
    [mode],
    [] as Ingredient[],
  );
  const ingById = useMemo(() => indexById(ingredients), [ingredients]);

  const canAdd = canSaveDrink(tier, mode, drinks.length);
  const onAdd = () => (canAdd ? setEditing('new') : setShowLimit(true));

  return (
    <div>
      <SectionTitle
        title={mode === 'home' ? t('drink.titleHome') : t('drink.titleCafe')}
        subtitle={!canAdd ? t('drink.limit', { n: FREE_DRINK_LIMIT }) : undefined}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => void addMissingPresets(mode, language)}>
              {t('drink.preset')}
            </Button>
            <Button onClick={onAdd}>+ {mode === 'home' ? t('drink.add') : t('drink.addCafe')}</Button>
          </div>
        }
      />

      {drinks.length === 0 ? (
        <EmptyState icon="📋" text={t('drink.empty')} action={<Button onClick={onAdd}>+ {t('drink.add')}</Button>} />
      ) : (
        <div className="space-y-2">
          {drinks.map((d) => (
            <Card
              key={d.id}
              className="cursor-pointer p-0 hover:bg-white/5"
              onClick={() => setEditing(d)}
            >
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-coffee-900">{d.name}</div>
                  <div className="text-xs text-coffee-500">
                    {d.items.length} {t('common.items')}
                    {mode === 'cafe' && d.prepMinutes ? ` · ${d.prepMinutes}m` : ''}
                  </div>
                </div>
                {mode === 'home' ? (
                  <HomeSummary cost={homeCupCost(d, ingById)} fmtMoney={fmt.money} label={t('drink.costPerCup')} />
                ) : activeMenu ? (
                  <CafeSummary drink={d} menu={activeMenu} ingById={ingById} />
                ) : null}
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <DrinkEditor
          mode={mode}
          drink={editing === 'new' ? null : editing}
          ingredients={ingredients}
          onClose={() => setEditing(null)}
          onDelete={
            editing !== 'new'
              ? async () => {
                  if (confirm(t('common.confirmDelete'))) {
                    await remove.drink(editing.id);
                    setEditing(null);
                  }
                }
              : undefined
          }
        />
      )}

      <Modal open={showLimit} onClose={() => setShowLimit(false)} title={t('pro.limitReached')}>
        <PaywallNote mode={mode} />
      </Modal>
    </div>
  );
}

function HomeSummary({ cost, fmtMoney, label }: { cost: number; fmtMoney: (v: number) => string; label: string }) {
  return (
    <div className="text-right">
      <div className="text-[10px] uppercase text-coffee-400">{label}</div>
      <div className="text-lg font-bold text-coffee-900 tnum">{fmtMoney(cost)}</div>
    </div>
  );
}

function CafeSummary({ drink, menu, ingById }: { drink: Drink; menu: Menu; ingById: Map<string, Ingredient> }) {
  const t = useT();
  const fmt = useFormat();
  const e = cafeDrinkEconomics(drink, menu, ingById);
  return (
    <div className="flex shrink-0 items-center gap-3 text-right">
      <div>
        <div className="text-[10px] uppercase text-coffee-400">{t('drink.cogs')}</div>
        <div className="font-semibold text-coffee-700 tnum">{fmt.money(e.cogs)}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase text-coffee-400">
          {drink.sellPrice ? t('drink.sellPrice') : t('drink.suggested')}
        </div>
        <div className="font-bold text-coffee-900 tnum">{fmt.money(e.price)}</div>
      </div>
      <div>
        <div className="text-[10px] uppercase text-coffee-400">{t('drink.margin')}</div>
        <div className={`font-bold tnum ${e.isLowMargin ? 'text-rose-400' : 'text-mint'}`}>
          {fmt.pct(e.margin)}
        </div>
      </div>
    </div>
  );
}

function DrinkEditor({
  mode,
  drink,
  ingredients,
  onClose,
  onDelete,
}: {
  mode: Mode;
  drink: Drink | null;
  ingredients: Ingredient[];
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const fmt = useFormat();
  const [name, setName] = useState(drink?.name ?? '');
  const [items, setItems] = useState<DrinkItem[]>(drink?.items ?? []);
  const [prepMinutes, setPrepMinutes] = useState<number | undefined>(drink?.prepMinutes ?? (mode === 'cafe' ? 2 : undefined));
  const [sellPrice, setSellPrice] = useState<number | undefined>(drink?.sellPrice);

  const ingById = useMemo(() => indexById(ingredients), [ingredients]);
  const tempDrink: Drink = {
    id: drink?.id ?? 'temp',
    mode,
    name,
    items,
    ...(prepMinutes !== undefined ? { prepMinutes } : {}),
    ...(sellPrice !== undefined ? { sellPrice } : {}),
    createdAt: 0,
    updatedAt: 0,
  };
  const lines = resolveLines(tempDrink, ingById);
  const cogs = lines.reduce((s, l) => s + l.lineCost, 0);

  const addLine = () => {
    const first = ingredients[0];
    if (!first) return;
    setItems((prev) => [
      ...prev,
      { ingredientId: first.id, amount: 0, unit: baseUnit(first.purchaseUnit), wastePct: DEFAULT_WASTE_PCT },
    ]);
  };
  const updateLine = (idx: number, patch: Partial<DrinkItem>) =>
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeLine = (idx: number) => setItems((prev) => prev.filter((_, i) => i !== idx));

  const valid = name.trim() !== '' && items.length > 0;

  const save = async () => {
    if (!valid) return;
    await upsertDrink({
      ...(drink?.id ? { id: drink.id } : {}),
      mode,
      name: name.trim(),
      items,
      ...(mode === 'cafe' && prepMinutes !== undefined ? { prepMinutes } : {}),
      ...(mode === 'cafe' && sellPrice !== undefined ? { sellPrice } : {}),
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={drink ? drink.name || t('common.edit') : mode === 'home' ? t('drink.add') : t('drink.addCafe')}
      footer={
        <>
          {onDelete && (
            <Button variant="danger" onClick={onDelete} className="mr-auto">
              {t('common.delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} disabled={!valid}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <TextField label={t('common.name')} value={name} onChange={setName} />

        <div>
          <div className="mb-1 flex items-center justify-between">
            <span className="label mb-0">{t('drink.ingredients')}</span>
            <button type="button" className="text-xs font-medium text-coffee-700" onClick={addLine}>
              + {t('drink.addItem')}
            </button>
          </div>
          {ingredients.length === 0 && <p className="text-xs text-coffee-500">{t('ing.empty')}</p>}
          <div className="space-y-2">
            {items.map((it, idx) => {
              const ing = ingById.get(it.ingredientId);
              const unitOpts = UNITS.filter((u) => (ing ? sameDimension(u, ing.purchaseUnit) : true));
              return (
                <div key={idx} className="rounded-xl border border-white/10 p-2">
                  <div className="flex items-center gap-2">
                    <select
                      className="input flex-1"
                      value={it.ingredientId}
                      onChange={(e) => {
                        const ni = ingredients.find((x) => x.id === e.target.value);
                        updateLine(idx, {
                          ingredientId: e.target.value,
                          ...(ni ? { unit: baseUnit(ni.purchaseUnit) } : {}),
                        });
                      }}
                    >
                      {ingredients.map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      aria-label={t('common.delete')}
                      className="px-2 text-coffee-400 hover:text-rose-400"
                      onClick={() => removeLine(idx)}
                    >
                      ✕
                    </button>
                  </div>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <NumberInput value={it.amount} onChange={(v) => updateLine(idx, { amount: v ?? 0 })} min={0} />
                    <SelectField
                      value={it.unit}
                      onChange={(u) => updateLine(idx, { unit: u as Unit })}
                      options={unitOpts.map((u) => ({ value: u, label: t(unitKey(u)) }))}
                    />
                    <NumberInput
                      value={it.wastePct}
                      onChange={(v) => updateLine(idx, { wastePct: v ?? 0 })}
                      min={0}
                      suffix="%"
                    />
                  </div>
                  <div className="mt-1 text-right text-xs text-coffee-500 tnum">{fmt.money(lines[idx]?.lineCost ?? 0)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {mode === 'cafe' && (
          <div className="grid grid-cols-2 gap-2">
            <NumberField
              label={t('drink.prep')}
              value={prepMinutes}
              onChange={(v) => setPrepMinutes(v ?? undefined)}
              min={0}
              suffix="m"
            />
            <NumberField
              label={`${t('drink.sellPrice')} (${t('common.optional')})`}
              value={sellPrice}
              onChange={(v) => setSellPrice(v ?? undefined)}
              min={0}
            />
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3">
          <span className="text-sm font-medium text-coffee-600">
            {mode === 'home' ? t('drink.costPerCup') : t('drink.cogs')}
          </span>
          <span className="text-xl font-bold text-coffee-900 tnum">{fmt.money(cogs)}</span>
        </div>
        {mode === 'cafe' && (
          <p className="flex items-center gap-1 text-xs text-coffee-400">
            <ProBadge /> {t('price.title')}: {t('nav.cafe.pricing')}
          </p>
        )}
      </div>
    </Modal>
  );
}

/** Insert any seeded preset recipes that are missing for this mode. */
export async function addMissingPresets(mode: Mode, language: 'ko' | 'en'): Promise<void> {
  const seed = buildSeed(language);
  const existing = await db.drinks.where('mode').equals(mode).toArray();
  const names = new Set(existing.map((d) => d.name));
  const toAdd = seed.drinks.filter((d) => d.mode === mode && !names.has(d.name));
  if (toAdd.length) await db.drinks.bulkPut(toAdd);
}
