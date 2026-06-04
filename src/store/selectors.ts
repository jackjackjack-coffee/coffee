/** Pure bridge between persisted entities and the calculation engine. */

import { itemCost, unitCost, type DrinkItemInput } from '../engine/cost';
import {
  composeDrinkEconomics,
  type DrinkEconomicsResult,
} from '../engine/drink';
import type { Drink, Ingredient, Menu } from '../data/types';

export function indexById<T extends { id: string }>(items: T[]): Map<string, T> {
  return new Map(items.map((it) => [it.id, it]));
}

/** Per-base-unit cost for an ingredient (0 if its purchase data is incomplete). */
export function ingredientUnitCost(ing: Ingredient | undefined): number {
  if (!ing) return 0;
  try {
    return unitCost(ing.purchaseQty, ing.purchaseUnit, ing.purchasePrice);
  } catch {
    return 0;
  }
}

export interface ResolvedLine {
  ingredientId: string;
  name: string;
  category: Ingredient['category'] | 'unknown';
  amount: number;
  unit: DrinkItemInput['unit'];
  unitCost: number;
  wastePct: number;
  lineCost: number;
  missing: boolean;
}

function lineCostOf(amount: number, unit: DrinkItemInput['unit'], uc: number, wastePct: number): number {
  try {
    return itemCost({ amount, unit, unitCost: uc, wastePct });
  } catch {
    return 0;
  }
}

export function resolveLines(drink: Drink, ingById: Map<string, Ingredient>): ResolvedLine[] {
  return drink.items.map((item) => {
    const ing = ingById.get(item.ingredientId);
    const uc = ingredientUnitCost(ing);
    return {
      ingredientId: item.ingredientId,
      name: ing?.name ?? '—',
      category: ing?.category ?? 'unknown',
      amount: item.amount,
      unit: item.unit,
      unitCost: uc,
      wastePct: item.wastePct,
      lineCost: lineCostOf(item.amount, item.unit, uc, item.wastePct),
      missing: !ing,
    };
  });
}

/** Engine inputs for a drink's ingredient lines. */
export function toEngineItems(drink: Drink, ingById: Map<string, Ingredient>): DrinkItemInput[] {
  return drink.items.map((item) => ({
    amount: item.amount,
    unit: item.unit,
    unitCost: ingredientUnitCost(ingById.get(item.ingredientId)),
    wastePct: item.wastePct,
  }));
}

/** Home: per-cup consumable (COGS) cost only. */
export function homeCupCost(drink: Drink, ingById: Map<string, Ingredient>): number {
  return resolveLines(drink, ingById).reduce((sum, l) => sum + l.lineCost, 0);
}

/** Café: full economics for a drink within a menu's pricing context. */
export function cafeDrinkEconomics(
  drink: Drink,
  menu: Menu,
  ingById: Map<string, Ingredient>,
): DrinkEconomicsResult {
  return composeDrinkEconomics({
    items: toEngineItems(drink, ingById),
    labor: { laborCostPerMin: menu.pricing.laborCostPerMin, prepMinutes: drink.prepMinutes ?? 0 },
    overhead: menu.pricing.overhead,
    pricing: {
      targetMargin: menu.pricing.targetMargin,
      charm: menu.pricing.charm,
      flagThresholdMargin: menu.pricing.flagThresholdMargin,
    },
    ...(drink.sellPrice !== undefined ? { price: drink.sellPrice } : {}),
  });
}
