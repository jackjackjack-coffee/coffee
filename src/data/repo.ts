/** Thin write helpers around Dexie — centralises id + timestamp handling. */

import { db } from './db';
import { newId } from '../lib/id';
import type {
  Drink,
  Equipment,
  ExpenseEntry,
  HomeSettings,
  Ingredient,
  Menu,
  SalesEntry,
  SpendEntry,
} from './types';

type New<T extends { id: string; createdAt: number; updatedAt: number }> = Omit<
  T,
  'id' | 'createdAt' | 'updatedAt'
> & { id?: string };

export async function upsertIngredient(data: New<Ingredient>): Promise<string> {
  const now = Date.now();
  const id = data.id ?? newId('ing');
  const existing = data.id ? await db.ingredients.get(data.id) : undefined;
  await db.ingredients.put({
    ...data,
    id,
    isPreset: existing?.isPreset ?? false,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
  return id;
}

export async function upsertDrink(data: New<Drink>): Promise<string> {
  const now = Date.now();
  const id = data.id ?? newId('drk');
  const existing = data.id ? await db.drinks.get(data.id) : undefined;
  await db.drinks.put({
    ...data,
    id,
    createdAt: existing?.createdAt ?? now,
    updatedAt: now,
  });
  return id;
}

export async function upsertEquipment(data: New<Equipment>): Promise<string> {
  const now = Date.now();
  const id = data.id ?? newId('eq');
  const existing = data.id ? await db.equipment.get(data.id) : undefined;
  await db.equipment.put({ ...data, id, createdAt: existing?.createdAt ?? now, updatedAt: now });
  return id;
}

export async function upsertMenu(data: New<Menu>): Promise<string> {
  const now = Date.now();
  const id = data.id ?? newId('menu');
  const existing = data.id ? await db.menus.get(data.id) : undefined;
  await db.menus.put({ ...data, id, createdAt: existing?.createdAt ?? now, updatedAt: now });
  return id;
}

export async function saveHomeSettings(data: HomeSettings): Promise<void> {
  await db.homeSettings.put({ ...data, id: 'home' });
}

export async function addSale(data: Omit<SalesEntry, 'id'>): Promise<string> {
  const id = newId('sal');
  await db.sales.put({ ...data, id });
  return id;
}

export async function addExpense(data: Omit<ExpenseEntry, 'id'>): Promise<string> {
  const id = newId('exp');
  await db.expenses.put({ ...data, id });
  return id;
}

export async function addSpend(data: Omit<SpendEntry, 'id'>): Promise<string> {
  const id = newId('spd');
  await db.spend.put({ ...data, id });
  return id;
}

export const remove = {
  ingredient: (id: string) => db.ingredients.delete(id),
  drink: (id: string) => db.drinks.delete(id),
  equipment: (id: string) => db.equipment.delete(id),
  menu: (id: string) => db.menus.delete(id),
  sale: (id: string) => db.sales.delete(id),
  expense: (id: string) => db.expenses.delete(id),
  spend: (id: string) => db.spend.delete(id),
};
