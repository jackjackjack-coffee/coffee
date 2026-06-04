import type { CharmStyle } from '../engine/pricing';
import type { EquipmentCategory, ExpenseCategory, IngredientCategory } from '../data/types';
import type { Unit } from '../engine/units';
import type { TKey } from '../i18n';

export const INGREDIENT_CATEGORIES: IngredientCategory[] = [
  'bean',
  'milk',
  'syrup',
  'sauce',
  'powder',
  'packaging',
  'other',
];

export const UNITS: Unit[] = ['g', 'kg', 'ml', 'l', 'ea'];

export const EQUIPMENT_CATEGORIES: EquipmentCategory[] = ['machine', 'grinder', 'kettle', 'other'];

export const CHARM_STYLES: CharmStyle[] = [
  'none',
  'ending99',
  'ending95',
  'whole',
  'ending900',
  'nearest100',
  'nearest500',
  'nearest1000',
];

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'ingredients',
  'rent',
  'labor',
  'utilities',
  'equipment',
  'marketing',
  'other',
];

export const catKey = (c: IngredientCategory): TKey => `cat.${c}` as TKey;
export const unitKey = (u: Unit): TKey => `unit.${u}` as TKey;
export const equipKey = (c: EquipmentCategory): TKey => `cat.${c}` as TKey;
export const charmKey = (c: CharmStyle): TKey => `price.charm.${c}` as TKey;
export const expKey = (c: ExpenseCategory): TKey => `exp.${c}` as TKey;
