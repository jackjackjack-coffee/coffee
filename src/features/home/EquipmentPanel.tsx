import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import { remove, upsertEquipment } from '../../data/repo';
import type { Drink, Equipment, EquipmentCategory, HomeSettings, Ingredient } from '../../data/types';
import {
  depreciationPerCupFor,
  lifespanInCups,
  trueCostPerCup,
} from '../../engine/equipment';
import { homeCupCost, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { EQUIPMENT_CATEGORIES, equipKey } from '../../lib/options';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { NumberField, SelectField, TextField } from '../../components/ui/fields';
import { Info } from '../../components/ui/Info';
import { Stat } from '../../components/ui/Stat';

function safeDep(eq: Equipment): number {
  try {
    return depreciationPerCupFor(eq.price, {
      ...(eq.lifespanCups !== undefined ? { lifespanCups: eq.lifespanCups } : {}),
      ...(eq.lifespanYears !== undefined ? { lifespanYears: eq.lifespanYears } : {}),
      ...(eq.cupsPerDay !== undefined ? { cupsPerDay: eq.cupsPerDay } : {}),
    });
  } catch {
    return 0;
  }
}

export function EquipmentPanel() {
  const t = useT();
  const fmt = useFormat();
  const [editing, setEditing] = useState<Equipment | 'new' | null>(null);
  const [recipeId, setRecipeId] = useState<string>('');

  const equipment = useLiveQuery(() => db.equipment.toArray(), [], [] as Equipment[]);
  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('home').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('home').toArray(), [], [] as Ingredient[]);
  const settings = useLiveQuery(() => db.homeSettings.get('home'), [], undefined as HomeSettings | undefined);

  const ingById = useMemo(() => indexById(ingredients), [ingredients]);
  const totalDep = equipment.reduce((s, e) => s + safeDep(e), 0);

  const selectedRecipe = drinks.find((d) => d.id === recipeId) ?? drinks[0];
  const consumable = selectedRecipe ? homeCupCost(selectedRecipe, ingById) : 0;
  const trueCost = trueCostPerCup({
    consumablePerCup: consumable,
    depreciationPerCup: totalDep,
    ...(settings?.electricityPerCup !== undefined ? { electricityPerCup: settings.electricityPerCup } : {}),
    ...(settings?.waterPerCup !== undefined ? { waterPerCup: settings.waterPerCup } : {}),
  });

  return (
    <div>
      <SectionTitle
        title={t('equip.title')}
        action={<Button onClick={() => setEditing('new')}>+ {t('equip.add')}</Button>}
      />

      {equipment.length === 0 ? (
        <EmptyState icon="⚙️" text={t('equip.empty')} action={<Button onClick={() => setEditing('new')}>+ {t('equip.add')}</Button>} />
      ) : (
        <>
          <div className="space-y-2">
            {equipment.map((eq) => (
              <Card key={eq.id} className="cursor-pointer p-0 hover:bg-coffee-100/60" onClick={() => setEditing(eq)}>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <div className="font-semibold text-coffee-900">{eq.name}</div>
                    <div className="text-xs text-coffee-500">
                      {t(equipKey(eq.category))} · {fmt.money(eq.price)} ·{' '}
                      {fmt.num(lifespanCupsSafe(eq))} {t('common.perCup').toLowerCase()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase text-coffee-400">{t('equip.depPerCup')}</div>
                    <div className="font-bold text-coffee-900 tnum">{fmt.unit(safeDep(eq))}</div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-4">
            <div className="mb-3 flex items-center text-sm font-semibold text-coffee-800">
              {t('equip.trueCost')}
              <Info text={t('equip.trueCostHint')} />
            </div>
            {drinks.length > 0 && (
              <SelectField
                label={t('roi.pickDrink')}
                value={selectedRecipe?.id ?? ''}
                onChange={setRecipeId}
                options={drinks.map((d) => ({ value: d.id, label: d.name }))}
                className="mb-3"
              />
            )}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <Stat label={t('drink.costPerCup')} amount={consumable} format={fmt.money} />
              <Stat label={t('equip.depPerCup')} amount={totalDep} format={fmt.money} />
              <Stat label={t('home.dash.perCupCafe')} amount={settings?.avgCafeCupPrice ?? 0} format={fmt.money} />
              <Stat
                label={t('equip.trueCost')}
                amount={trueCost}
                format={fmt.money}
                accent={settings && trueCost < settings.avgCafeCupPrice ? 'good' : 'warn'}
              />
            </div>
          </Card>
        </>
      )}

      {editing && (
        <EquipmentForm
          equipment={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onDelete={
            editing !== 'new'
              ? async () => {
                  if (confirm(t('common.confirmDelete'))) {
                    await remove.equipment(editing.id);
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

function lifespanCupsSafe(eq: Equipment): number {
  try {
    return lifespanInCups({
      ...(eq.lifespanCups !== undefined ? { lifespanCups: eq.lifespanCups } : {}),
      ...(eq.lifespanYears !== undefined ? { lifespanYears: eq.lifespanYears } : {}),
      ...(eq.cupsPerDay !== undefined ? { cupsPerDay: eq.cupsPerDay } : {}),
    });
  } catch {
    return 0;
  }
}

function EquipmentForm({
  equipment,
  onClose,
  onDelete,
}: {
  equipment: Equipment | null;
  onClose: () => void;
  onDelete?: () => void;
}) {
  const t = useT();
  const [name, setName] = useState(equipment?.name ?? '');
  const [category, setCategory] = useState<EquipmentCategory>(equipment?.category ?? 'machine');
  const [price, setPrice] = useState<number | undefined>(equipment?.price);
  const [mode, setMode] = useState<'years' | 'cups'>(equipment?.lifespanCups ? 'cups' : 'years');
  const [years, setYears] = useState<number | undefined>(equipment?.lifespanYears ?? 5);
  const [cupsPerDay, setCupsPerDay] = useState<number | undefined>(equipment?.cupsPerDay ?? 2);
  const [cups, setCups] = useState<number | undefined>(equipment?.lifespanCups);

  const valid =
    name.trim() !== '' &&
    (price ?? 0) >= 0 &&
    (mode === 'cups' ? (cups ?? 0) > 0 : (years ?? 0) > 0 && (cupsPerDay ?? 0) > 0);

  const save = async () => {
    if (!valid) return;
    await upsertEquipment({
      ...(equipment?.id ? { id: equipment.id } : {}),
      name: name.trim(),
      category,
      price: price ?? 0,
      ...(mode === 'cups'
        ? { lifespanCups: cups ?? 0 }
        : { lifespanYears: years ?? 0, cupsPerDay: cupsPerDay ?? 0 }),
    });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={equipment ? t('common.edit') : t('equip.add')}
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
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label={t('common.category')}
            value={category}
            onChange={setCategory}
            options={EQUIPMENT_CATEGORIES.map((c) => ({ value: c, label: t(equipKey(c)) }))}
          />
          <NumberField label={t('common.price')} value={price} onChange={(v) => setPrice(v ?? undefined)} min={0} />
        </div>
        <SelectField
          label={t('equip.lifespanYears')}
          value={mode}
          onChange={setMode}
          options={[
            { value: 'years', label: t('equip.lifespanYears') },
            { value: 'cups', label: t('equip.lifespanCups') },
          ]}
        />
        {mode === 'cups' ? (
          <NumberField label={t('equip.lifespanCups')} value={cups} onChange={(v) => setCups(v ?? undefined)} min={1} />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <NumberField label={t('equip.lifespanYears')} value={years} onChange={(v) => setYears(v ?? undefined)} min={0} />
            <NumberField label={t('equip.cupsPerDay')} value={cupsPerDay} onChange={(v) => setCupsPerDay(v ?? undefined)} min={0} />
          </div>
        )}
      </div>
    </Modal>
  );
}
