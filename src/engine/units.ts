/**
 * Unit handling for the costing engine.
 *
 * Everything is normalised to a "base" unit before any money math happens:
 *   - weight  -> grams (g)      (kg = 1000 g)
 *   - volume  -> millilitres(ml)(l  = 1000 ml)
 *   - count   -> each (ea)
 *
 * Keeping a single base per dimension means a unit cost is always
 * "currency per base unit" and amounts are always comparable.
 */

export const WEIGHT_UNITS = ['g', 'kg'] as const;
export const VOLUME_UNITS = ['ml', 'l'] as const;
export const COUNT_UNITS = ['ea'] as const;

export type WeightUnit = (typeof WEIGHT_UNITS)[number];
export type VolumeUnit = (typeof VOLUME_UNITS)[number];
export type CountUnit = (typeof COUNT_UNITS)[number];
export type Unit = WeightUnit | VolumeUnit | CountUnit;

export type BaseUnit = 'g' | 'ml' | 'ea';
export type Dimension = 'weight' | 'volume' | 'count';

export const ALL_UNITS: readonly Unit[] = [
  ...WEIGHT_UNITS,
  ...VOLUME_UNITS,
  ...COUNT_UNITS,
];

const FACTOR_TO_BASE: Record<Unit, number> = {
  g: 1,
  kg: 1000,
  ml: 1,
  l: 1000,
  ea: 1,
};

const BASE_OF: Record<Unit, BaseUnit> = {
  g: 'g',
  kg: 'g',
  ml: 'ml',
  l: 'ml',
  ea: 'ea',
};

const DIMENSION_OF: Record<Unit, Dimension> = {
  g: 'weight',
  kg: 'weight',
  ml: 'volume',
  l: 'volume',
  ea: 'count',
};

export function isUnit(value: string): value is Unit {
  return value in FACTOR_TO_BASE;
}

export function baseUnit(unit: Unit): BaseUnit {
  return BASE_OF[unit];
}

export function dimensionOf(unit: Unit): Dimension {
  return DIMENSION_OF[unit];
}

/** True when two units measure the same physical dimension. */
export function sameDimension(a: Unit, b: Unit): boolean {
  return DIMENSION_OF[a] === DIMENSION_OF[b];
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
 * Convert a quantity expressed in `unit` to its base unit.
 * @throws RangeError on negative / non-finite quantities.
 */
export function toBase(qty: number, unit: Unit): number {
  assertNonNegativeFinite(qty, 'qty');
  return qty * FACTOR_TO_BASE[unit];
}

/** Convert a base-unit amount back into a display unit. */
export function fromBase(baseQty: number, unit: Unit): number {
  assertNonNegativeFinite(baseQty, 'baseQty');
  return baseQty / FACTOR_TO_BASE[unit];
}
