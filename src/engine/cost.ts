/**
 * Unit cost (formula 1) and drink COGS (formula 2).
 *
 * Conventions:
 *   - A "unit cost" is currency per BASE unit (per g / per ml / per ea).
 *   - `wastePct` is a percentage number, e.g. 5 means 5% waste/loss.
 *   - All money values are in whatever currency the caller uses; the engine
 *     never formats, it only computes.
 */

import { toBase, type Unit } from './units';

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number (got ${value})`);
  }
  if (value <= 0) {
    throw new RangeError(`${name} must be > 0 (got ${value})`);
  }
}

function assertNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number (got ${value})`);
  }
  if (value < 0) {
    throw new RangeError(`${name} must be >= 0 (got ${value})`);
  }
}

/**
 * Formula 1 — unit cost.
 * Given a purchase of `purchaseQty` (in `purchaseUnit`) for `purchasePrice`,
 * return the cost per BASE unit.
 *
 *   unitCost = purchasePrice / toBase(purchaseQty, purchaseUnit)
 *
 * Example: 1 kg of beans for ₩20,000 -> 20000 / 1000 = ₩20 per gram.
 */
export function unitCost(
  purchaseQty: number,
  purchaseUnit: Unit,
  purchasePrice: number,
): number {
  assertNonNegativeFinite(purchasePrice, 'purchasePrice');
  const baseQty = toBase(purchaseQty, purchaseUnit);
  assertPositiveFinite(baseQty, 'purchaseQty');
  return purchasePrice / baseQty;
}

export interface DrinkItemInput {
  /** Amount used, expressed in `unit`. */
  amount: number;
  unit: Unit;
  /** Cost per BASE unit (from {@link unitCost}). */
  unitCost: number;
  /** Loss/spillage as a percentage number (5 = 5%). Defaults to 0. */
  wastePct?: number;
}

/**
 * Cost contribution of a single ingredient line, waste included.
 *
 *   itemCost = toBase(amount, unit) * unitCost * (1 + wastePct/100)
 */
export function itemCost(item: DrinkItemInput): number {
  const baseAmount = toBase(item.amount, item.unit);
  assertNonNegativeFinite(item.unitCost, 'unitCost');
  const wastePct = item.wastePct ?? 0;
  assertNonNegativeFinite(wastePct, 'wastePct');
  return baseAmount * item.unitCost * (1 + wastePct / 100);
}

export interface PackagingInput {
  /** Cup, lid, sleeve, straw… each given as a flat cost per drink. */
  cup?: number;
  lid?: number;
  sleeve?: number;
  other?: number;
}

export function packagingCost(packaging?: PackagingInput): number {
  if (!packaging) return 0;
  const parts = [packaging.cup, packaging.lid, packaging.sleeve, packaging.other];
  let sum = 0;
  for (const p of parts) {
    if (p === undefined) continue;
    assertNonNegativeFinite(p, 'packaging');
    sum += p;
  }
  return sum;
}

/**
 * Formula 2 — drink COGS.
 * Sum of every ingredient line (waste included) plus optional packaging.
 */
export function drinkCOGS(
  items: DrinkItemInput[],
  packaging?: PackagingInput,
): number {
  const ingredients = items.reduce((sum, item) => sum + itemCost(item), 0);
  return ingredients + packagingCost(packaging);
}

/** Per-line breakdown, handy for UIs that show "where the cost goes". */
export interface CostBreakdownLine {
  index: number;
  cost: number;
  /** Share of total COGS, 0..1. */
  share: number;
}

export function cogsBreakdown(
  items: DrinkItemInput[],
  packaging?: PackagingInput,
): { total: number; lines: CostBreakdownLine[]; packaging: number } {
  const lineCosts = items.map(itemCost);
  const pkg = packagingCost(packaging);
  const total = lineCosts.reduce((s, c) => s + c, 0) + pkg;
  const lines = lineCosts.map((cost, index) => ({
    index,
    cost,
    share: total > 0 ? cost / total : 0,
  }));
  return { total, lines, packaging: pkg };
}
