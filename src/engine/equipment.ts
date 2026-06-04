/**
 * Equipment depreciation (formula 5) and the "true" cost per cup (formula 6).
 *
 * Home machines/grinders are a sunk cost spread across the cups they make.
 * We amortise the purchase price over an expected lifespan (in cups) and add
 * that to the per-cup consumable cost (plus optional utilities).
 */

const DAYS_PER_YEAR = 365;

function assertPositiveFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${name} must be > 0 (got ${value})`);
  }
}

function assertNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${name} must be >= 0 (got ${value})`);
  }
}

export interface LifespanInput {
  /** Direct lifespan in cups (takes priority when > 0). */
  lifespanCups?: number;
  /** Otherwise, lifespan in years… */
  lifespanYears?: number;
  /** …combined with expected cups/day. */
  cupsPerDay?: number;
}

/**
 * Resolve an expected lifespan to a number of cups.
 * Prefers an explicit `lifespanCups`; otherwise years × cupsPerDay × 365.
 */
export function lifespanInCups(input: LifespanInput): number {
  if (input.lifespanCups !== undefined && input.lifespanCups > 0) {
    return input.lifespanCups;
  }
  if (
    input.lifespanYears !== undefined &&
    input.cupsPerDay !== undefined &&
    input.lifespanYears > 0 &&
    input.cupsPerDay > 0
  ) {
    return input.lifespanYears * input.cupsPerDay * DAYS_PER_YEAR;
  }
  throw new RangeError(
    'lifespanInCups needs either lifespanCups > 0 or lifespanYears & cupsPerDay > 0',
  );
}

/** Formula 5 — depreciation charged to each cup. */
export function depreciationPerCup(price: number, lifespanCups: number): number {
  assertNonNegativeFinite(price, 'price');
  assertPositiveFinite(lifespanCups, 'lifespanCups');
  return price / lifespanCups;
}

/** Convenience: depreciation per cup straight from a {@link LifespanInput}. */
export function depreciationPerCupFor(price: number, lifespan: LifespanInput): number {
  return depreciationPerCup(price, lifespanInCups(lifespan));
}

export interface TrueCostInput {
  /** Per-cup consumable (bean/milk/etc.) cost — the COGS of one home cup. */
  consumablePerCup: number;
  /** Per-cup depreciation across all registered equipment. */
  depreciationPerCup: number;
  /** Optional electricity cost per cup. */
  electricityPerCup?: number;
  /** Optional water cost per cup. */
  waterPerCup?: number;
}

/**
 * Formula 6 — the real cost of a home cup:
 *   consumables + equipment depreciation + (optional) electricity + water.
 */
export function trueCostPerCup(input: TrueCostInput): number {
  assertNonNegativeFinite(input.consumablePerCup, 'consumablePerCup');
  assertNonNegativeFinite(input.depreciationPerCup, 'depreciationPerCup');
  const electricity = input.electricityPerCup ?? 0;
  const water = input.waterPerCup ?? 0;
  assertNonNegativeFinite(electricity, 'electricityPerCup');
  assertNonNegativeFinite(water, 'waterPerCup');
  return input.consumablePerCup + input.depreciationPerCup + electricity + water;
}

/** Total per-cup depreciation across several pieces of equipment. */
export function totalDepreciationPerCup(
  items: Array<{ price: number; lifespan: LifespanInput }>,
): number {
  return items.reduce((sum, it) => sum + depreciationPerCupFor(it.price, it.lifespan), 0);
}
