/** Persisted domain model (IndexedDB via Dexie). */

import type { Unit } from '../engine/units';
import type { Overhead, CharmStyle } from '../engine/pricing';
import type { PackagingInput } from '../engine/cost';

export type ID = string;
export type Mode = 'home' | 'cafe';
export type Language = 'ko' | 'en';
export type Currency = 'KRW' | 'USD' | 'EUR';
export type LicenseTier = 'free' | 'personal' | 'cafe';

export type IngredientCategory =
  | 'bean'
  | 'milk'
  | 'syrup'
  | 'sauce'
  | 'powder'
  | 'packaging'
  | 'other';

export interface Ingredient {
  id: ID;
  /** Home and Café keep separate libraries (separate workspaces). */
  mode: Mode;
  name: string;
  category: IngredientCategory;
  purchaseQty: number;
  purchaseUnit: Unit;
  purchasePrice: number;
  supplier?: string;
  /** Seeded sample; shown with an "example price" hint until edited. */
  isPreset?: boolean;
  note?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DrinkItem {
  ingredientId: ID;
  amount: number;
  unit: Unit;
  /** Percentage number, e.g. 5 = 5% loss. */
  wastePct: number;
}

export interface Drink {
  id: ID;
  mode: Mode;
  name: string;
  items: DrinkItem[];
  packaging?: PackagingInput;
  /** Café: minutes to prepare (drives labour cost). */
  prepMinutes?: number;
  /** Café: actual selling price, if set. */
  sellPrice?: number;
  isPreset?: boolean;
  createdAt: number;
  updatedAt: number;
}

export type EquipmentCategory = 'machine' | 'grinder' | 'kettle' | 'other';

export interface Equipment {
  id: ID;
  name: string;
  price: number;
  /** Either a direct cup lifespan… */
  lifespanCups?: number;
  /** …or years (combined with cupsPerDay). */
  lifespanYears?: number;
  cupsPerDay?: number;
  category: EquipmentCategory;
  createdAt: number;
  updatedAt: number;
}

export interface MenuPricing {
  /** Target margin as a fraction (0.7 = 70%). */
  targetMargin: number;
  /** Margin below this fraction raises the low-margin flag. */
  flagThresholdMargin: number;
  laborCostPerMin: number;
  overhead: Overhead;
  charm: CharmStyle;
}

export interface Menu {
  id: ID;
  name: string;
  drinkIds: ID[];
  pricing: MenuPricing;
  isDefault?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface HomeSettings {
  id: 'home';
  cupsPerDay: number;
  avgCafeCupPrice: number;
  electricityPerCup?: number;
  waterPerCup?: number;
}

export interface SalesEntry {
  id: ID;
  date: string; // ISO yyyy-mm-dd
  drinkId: ID;
  qty: number;
  unitPrice: number;
}

export type ExpenseCategory =
  | 'ingredients'
  | 'rent'
  | 'labor'
  | 'utilities'
  | 'equipment'
  | 'marketing'
  | 'other';

export interface ExpenseEntry {
  id: ID;
  date: string;
  category: ExpenseCategory;
  amount: number;
  note?: string;
}

export type SpendType = 'beans' | 'equipment' | 'cafe' | 'other';

export interface SpendEntry {
  id: ID;
  date: string;
  type: SpendType;
  amount: number;
  note?: string;
}

export interface MetaEntry {
  key: string;
  value: unknown;
}
