/**
 * Equipment break-even & ROI (formula 7).
 *
 * The pitch: a home setup costs money up front but every cup you make instead
 * of buying saves (cafe price − home consumable cost). How many cups / days /
 * months until the machine pays for itself, and what do you save after that?
 */

const AVG_DAYS_PER_MONTH = 30.4375;
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

/** Per-cup saving vs. buying out: cafe price − home consumable cost. */
export function savingsPerCup(cafePrice: number, homeConsumablePerCup: number): number {
  assertNonNegativeFinite(cafePrice, 'cafePrice');
  assertNonNegativeFinite(homeConsumablePerCup, 'homeConsumablePerCup');
  return cafePrice - homeConsumablePerCup;
}

/**
 * Cups needed to recover the equipment price.
 * Returns Infinity when there is no per-cup saving (never breaks even).
 */
export function breakevenCups(equipmentPrice: number, perCupSaving: number): number {
  assertNonNegativeFinite(equipmentPrice, 'equipmentPrice');
  if (perCupSaving <= 0) return Infinity;
  return equipmentPrice / perCupSaving;
}

export interface BreakevenInput {
  equipmentPrice: number;
  /** C_cafe — what one cup costs at a cafe. */
  cafePrice: number;
  /** Home consumable (COGS) cost of one cup. */
  homeConsumablePerCup: number;
  cupsPerDay: number;
}

export interface BreakevenResult {
  perCupSaving: number;
  breakevenCups: number;
  breakevenDays: number;
  breakevenMonths: number;
  annualSavingsAfterBreakeven: number;
  /** True when home cost ≥ cafe price, so it never pays off. */
  neverBreaksEven: boolean;
}

export function breakeven(input: BreakevenInput): BreakevenResult {
  assertPositiveFinite(input.cupsPerDay, 'cupsPerDay');
  const perCupSaving = savingsPerCup(input.cafePrice, input.homeConsumablePerCup);
  const cups = breakevenCups(input.equipmentPrice, perCupSaving);
  const neverBreaksEven = !Number.isFinite(cups);
  const days = neverBreaksEven ? Infinity : cups / input.cupsPerDay;
  const months = neverBreaksEven ? Infinity : days / AVG_DAYS_PER_MONTH;
  const annualSavingsAfterBreakeven = Math.max(0, perCupSaving) * input.cupsPerDay * DAYS_PER_YEAR;
  return {
    perCupSaving,
    breakevenCups: cups,
    breakevenDays: days,
    breakevenMonths: months,
    annualSavingsAfterBreakeven,
    neverBreaksEven,
  };
}

export interface RoiPoint {
  month: number;
  day: number;
  cups: number;
  /** Cumulative consumable saving so far (before subtracting equipment). */
  grossSavings: number;
  /** Net position: grossSavings − equipmentPrice (negative until break-even). */
  net: number;
}

/**
 * Cumulative-savings curve for the ROI chart.
 * Generates one point per month from 0..months (inclusive).
 */
export function roiCurve(
  input: BreakevenInput,
  options?: { months?: number },
): RoiPoint[] {
  assertPositiveFinite(input.cupsPerDay, 'cupsPerDay');
  const perCupSaving = savingsPerCup(input.cafePrice, input.homeConsumablePerCup);
  const months = Math.max(1, Math.floor(options?.months ?? 24));
  const points: RoiPoint[] = [];
  for (let m = 0; m <= months; m++) {
    const day = m * AVG_DAYS_PER_MONTH;
    const cups = input.cupsPerDay * day;
    const grossSavings = Math.max(0, perCupSaving) * cups;
    points.push({
      month: m,
      day,
      cups,
      grossSavings,
      net: grossSavings - input.equipmentPrice,
    });
  }
  return points;
}

/**
 * A sensible chart horizon: enough months to show break-even plus headroom,
 * clamped to a readable range.
 */
export function suggestRoiMonths(result: BreakevenResult): number {
  if (result.neverBreaksEven || !Number.isFinite(result.breakevenMonths)) return 24;
  return Math.min(60, Math.max(6, Math.ceil(result.breakevenMonths * 1.5)));
}
