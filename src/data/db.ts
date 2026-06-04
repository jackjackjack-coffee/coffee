/** IndexedDB persistence via Dexie. */

import Dexie, { type Table } from 'dexie';
import type {
  Drink,
  Equipment,
  ExpenseEntry,
  HomeSettings,
  Ingredient,
  Menu,
  MetaEntry,
  SalesEntry,
  SpendEntry,
  Language,
} from './types';
import { buildSeed } from './presets';

export class CoffeeDB extends Dexie {
  ingredients!: Table<Ingredient, string>;
  drinks!: Table<Drink, string>;
  equipment!: Table<Equipment, string>;
  menus!: Table<Menu, string>;
  homeSettings!: Table<HomeSettings, string>;
  sales!: Table<SalesEntry, string>;
  expenses!: Table<ExpenseEntry, string>;
  spend!: Table<SpendEntry, string>;
  meta!: Table<MetaEntry, string>;

  constructor() {
    super('coffee-accountant');
    this.version(1).stores({
      ingredients: 'id, mode, category, name',
      drinks: 'id, mode, name',
      equipment: 'id, category',
      menus: 'id',
      homeSettings: 'id',
      sales: 'id, date, drinkId',
      expenses: 'id, date, category',
      spend: 'id, date, type',
      meta: 'key',
    });
  }
}

export const db = new CoffeeDB();

const SEED_FLAG = 'seeded.v1';

/** Populate the example library/recipes once, on first ever launch. */
export async function ensureSeeded(language: Language): Promise<void> {
  const flag = await db.meta.get(SEED_FLAG);
  if (flag?.value === true) return;
  const seed = buildSeed(language);
  await db.transaction(
    'rw',
    [db.ingredients, db.drinks, db.menus, db.homeSettings, db.meta],
    async () => {
      // Guard against a race where two tabs seed at once.
      const again = await db.meta.get(SEED_FLAG);
      if (again?.value === true) return;
      await db.ingredients.bulkPut(seed.ingredients);
      await db.drinks.bulkPut(seed.drinks);
      await db.menus.put(seed.menu);
      await db.homeSettings.put(seed.homeSettings);
      await db.meta.put({ key: SEED_FLAG, value: true });
    },
  );
}

/** Wipe everything and re-seed (used by "reset sample data" in Settings). */
export async function resetToSeed(language: Language): Promise<void> {
  await db.transaction(
    'rw',
    [db.ingredients, db.drinks, db.equipment, db.menus, db.homeSettings, db.sales, db.expenses, db.spend, db.meta],
    async () => {
      await Promise.all([
        db.ingredients.clear(),
        db.drinks.clear(),
        db.equipment.clear(),
        db.menus.clear(),
        db.homeSettings.clear(),
        db.sales.clear(),
        db.expenses.clear(),
        db.spend.clear(),
        db.meta.clear(),
      ]);
      const seed = buildSeed(language);
      await db.ingredients.bulkPut(seed.ingredients);
      await db.drinks.bulkPut(seed.drinks);
      await db.menus.put(seed.menu);
      await db.homeSettings.put(seed.homeSettings);
      await db.meta.put({ key: SEED_FLAG, value: true });
    },
  );
}

export async function getHomeSettings(): Promise<HomeSettings> {
  const s = await db.homeSettings.get('home');
  return (
    s ?? { id: 'home', cupsPerDay: 2, avgCafeCupPrice: 4500 }
  );
}
