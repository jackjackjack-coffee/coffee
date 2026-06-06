import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { remove, upsertIngredient } from '../../data/repo';
import type { Ingredient, IngredientCategory, Mode } from '../../data/types';
import type { Unit } from '../../engine/units';
import { ingredientUnitCost } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import {
  INGREDIENT_CATEGORIES,
  UNITS,
  catKey,
  unitKey,
} from '../../lib/options';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { NumberField, SelectField, TextField } from '../../components/ui/fields';
import { Info } from '../../components/ui/Info';

export function IngredientsManager({ mode }: { mode: Mode }) {
  const t = useT();
  const fmt = useFormat();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Ingredient | 'new' | null>(null);

  const ingredients = useLiveQuery(
    () => db.ingredients.where('mode').equals(mode).toArray(),
    [mode],
    [] as Ingredient[],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q ? ingredients.filter((i) => i.name.toLowerCase().includes(q)) : ingredients;
    return [...list].sort((a, b) =>
      a.category === b.category ? a.name.localeCompare(b.name) : a.category.localeCompare(b.category),
    );
  }, [ingredients, search]);

  const grouped = useMemo(() => {
    const map = new Map<IngredientCategory, Ingredient[]>();
    for (const i of filtered) {
      const arr = map.get(i.category) ?? [];
      arr.push(i);
      map.set(i.category, arr);
    }
    return map;
  }, [filtered]);

  return (
    <div>
      <SectionTitle
        title={mode === 'home' ? t('ing.titleHome') : t('ing.title')}
        subtitle={t('ing.hint')}
        action={<Button onClick={() => setEditing('new')}>+ {t('ing.add')}</Button>}
      />

      {ingredients.length > 0 && (
        <input
          className="input mb-3"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      )}

      {ingredients.length === 0 ? (
        <EmptyState
          icon="🧺"
          text={t('ing.empty')}
          action={<Button onClick={() => setEditing('new')}>+ {t('ing.add')}</Button>}
        />
      ) : (
        <div className="space-y-4">
          {[...grouped.entries()].map(([cat, items]) => (
            <div key={cat}>
              <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-coffee-400">
                {t(catKey(cat))}
              </div>
              <Card className="divide-y divide-coffee-100 p-0">
                {items.map((ing) => (
                  <button
                    key={ing.id}
                    type="button"
                    onClick={() => setEditing(ing)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-coffee-100/60"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium text-coffee-900">{ing.name}</span>
                        {ing.isPreset && (
                          <span className="chip bg-coffee-100/60 text-coffee-500" title={t('flag.example')}>
                            {t('common.preset')}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-coffee-500 tnum">
                        {fmt.num(ing.purchaseQty, 2)} {t(unitKey(ing.purchaseUnit))} · {fmt.money(ing.purchasePrice)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-coffee-900 tnum">{fmt.unit(ingredientUnitCost(ing))}</div>
                      <div className="text-[10px] text-coffee-400">
                        / {t(unitKey(baseUnitOf(ing.purchaseUnit)))}
                      </div>
                    </div>
                  </button>
                ))}
              </Card>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <IngredientForm
          mode={mode}
          ingredient={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onDelete={
            editing !== 'new'
              ? async () => {
                  if (confirm(t('common.confirmDelete'))) {
                    await remove.ingredient(editing.id);
                    setEditing(null);
                  }
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

function baseUnitOf(u: Unit): Unit {
  if (u === 'kg') return 'g';
  if (u === 'l') return 'ml';
  return u;
}

function IngredientForm({
  mode,
  ingredient,
  onClose,
  onDelete,
}: {
  mode: Mode;
  ingredient: Ingredient | null;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const fmt = useFormat();
  const [name, setName] = useState(ingredient?.name ?? '');
  const [category, setCategory] = useState<IngredientCategory>(ingredient?.category ?? 'bean');
  const [qty, setQty] = useState<number | undefined>(ingredient?.purchaseQty ?? 1);
  const [unit, setUnit] = useState<Unit>(ingredient?.purchaseUnit ?? 'kg');
  const [price, setPrice] = useState<number | undefined>(ingredient?.purchasePrice ?? undefined);
  const [supplier, setSupplier] = useState(ingredient?.supplier ?? '');

  const valid = name.trim() !== '' && (qty ?? 0) > 0 && (price ?? 0) >= 0;
  const preview =
    (qty ?? 0) > 0 && price !== undefined
      ? ingredientUnitCost({
          ...(ingredient ?? ({} as Ingredient)),
          purchaseQty: qty ?? 1,
          purchaseUnit: unit,
          purchasePrice: price ?? 0,
        })
      : 0;

  const save = async () => {
    if (!valid) return;
    await upsertIngredient({
      ...(ingredient?.id ? { id: ingredient.id } : {}),
      mode,
      name: name.trim(),
      category,
      purchaseQty: qty ?? 1,
      purchaseUnit: unit,
      purchasePrice: price ?? 0,
      ...(supplier.trim() ? { supplier: supplier.trim() } : {}),
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={ingredient ? t('common.edit') : t('ing.add')}
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
      <div className="space-y-3">
        <TextField label={t('common.name')} value={name} onChange={setName} />
        <SelectField
          label={t('common.category')}
          value={category}
          onChange={setCategory}
          options={INGREDIENT_CATEGORIES.map((c) => ({ value: c, label: t(catKey(c)) }))}
        />
        <div className="grid grid-cols-3 gap-2">
          <NumberField label={t('common.qty')} value={qty} onChange={(v) => setQty(v ?? undefined)} min={0} />
          <SelectField
            label={t('common.unit')}
            value={unit}
            onChange={setUnit}
            options={UNITS.map((u) => ({ value: u, label: t(unitKey(u)) }))}
          />
          <NumberField label={t('common.price')} value={price} onChange={(v) => setPrice(v ?? undefined)} min={0} />
        </div>
        <TextField
          label={`${t('common.supplier')} (${t('common.optional')})`}
          value={supplier}
          onChange={setSupplier}
        />
        <div className="flex items-center justify-between rounded-xl bg-coffee-100/60 px-4 py-3">
          <span className="text-sm text-coffee-600">
            {t('ing.unitCost')}
            <Info text={t('ing.hint')} />
          </span>
          <span className="text-lg font-bold text-coffee-900 tnum">
            {fmt.unit(preview)} / {t(unitKey(baseUnitOf(unit)))}
          </span>
        </div>
      </div>
    </Modal>
  );
}
