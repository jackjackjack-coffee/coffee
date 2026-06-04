/**
 * Full cost (formula 3) and pricing (formula 4).
 *
 * Margins are expressed as fractions in [0, 1) (0.65 = 65%).
 * Percentages that come straight from UI fields (waste, markup, overhead %)
 * are percentage numbers and are converted internally.
 */

export type OverheadMode = 'perDrink' | 'pctRevenue';

export type Overhead =
  | { mode: 'perDrink'; amount: number }
  | { mode: 'pctRevenue'; pct: number };

function assertNonNegativeFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number (got ${value})`);
  }
  if (value < 0) {
    throw new RangeError(`${name} must be >= 0 (got ${value})`);
  }
}

/** Formula 3a — labour cost = rate per minute × prep minutes. */
export function laborCost(laborCostPerMin: number, prepMinutes: number): number {
  assertNonNegativeFinite(laborCostPerMin, 'laborCostPerMin');
  assertNonNegativeFinite(prepMinutes, 'prepMinutes');
  return laborCostPerMin * prepMinutes;
}

/** Fixed (per-drink) portion of overhead. Revenue-% overhead needs a price. */
export function fixedOverhead(overhead?: Overhead): number {
  if (!overhead) return 0;
  if (overhead.mode === 'perDrink') {
    assertNonNegativeFinite(overhead.amount, 'overhead.amount');
    return overhead.amount;
  }
  return 0;
}

/** Revenue-% overhead resolved against a known price. */
export function revenueOverhead(overhead: Overhead | undefined, price: number): number {
  if (!overhead || overhead.mode !== 'pctRevenue') return 0;
  assertNonNegativeFinite(overhead.pct, 'overhead.pct');
  assertNonNegativeFinite(price, 'price');
  return (overhead.pct / 100) * price;
}

/**
 * Formula 3 — full cost at a known selling price.
 *   fullCost = COGS + labour + fixedOverhead + (revenue% × price)
 */
export function fullCost(
  cogs: number,
  labor: number,
  overhead: Overhead | undefined,
  price: number,
): number {
  assertNonNegativeFinite(cogs, 'cogs');
  assertNonNegativeFinite(labor, 'labor');
  return cogs + labor + fixedOverhead(overhead) + revenueOverhead(overhead, price);
}

/**
 * Formula 4 — price from a target margin.
 *   price = cost / (1 − margin)
 *
 * `cost` is whichever cost base the caller treats as the margin base
 * (COGS only for the simple case, or COGS+labour+fixed overhead for full cost).
 */
export function priceFromMargin(cost: number, margin: number): number {
  assertNonNegativeFinite(cost, 'cost');
  if (!Number.isFinite(margin) || margin < 0 || margin >= 1) {
    throw new RangeError(`margin must be in [0, 1) (got ${margin})`);
  }
  return cost / (1 - margin);
}

/**
 * Price from a target margin when overhead is charged as a % of revenue.
 *   price = costExclRevenueOverhead / (1 − margin − overheadPct)
 */
export function priceFromMarginWithRevenueOverhead(
  costExclRevenueOverhead: number,
  margin: number,
  overheadPct: number,
): number {
  assertNonNegativeFinite(costExclRevenueOverhead, 'cost');
  assertNonNegativeFinite(overheadPct, 'overheadPct');
  const o = overheadPct / 100;
  const denom = 1 - margin - o;
  if (!Number.isFinite(margin) || margin < 0 || denom <= 0) {
    throw new RangeError(
      `margin + overhead must be < 1 (margin=${margin}, overheadPct=${overheadPct})`,
    );
  }
  return costExclRevenueOverhead / denom;
}

/** Markup pricing: price = cost × (1 + markupPct/100). */
export function priceFromMarkup(cost: number, markupPct: number): number {
  assertNonNegativeFinite(cost, 'cost');
  assertNonNegativeFinite(markupPct, 'markupPct');
  return cost * (1 + markupPct / 100);
}

/** Gross margin achieved at a given price: (price − cost) / price. */
export function marginOf(cost: number, price: number): number {
  assertNonNegativeFinite(cost, 'cost');
  if (price <= 0) {
    throw new RangeError(`price must be > 0 (got ${price})`);
  }
  return (price - cost) / price;
}

/** Cost ratio (food cost %): cost / price. */
export function costRatio(cost: number, price: number): number {
  assertNonNegativeFinite(cost, 'cost');
  if (price <= 0) {
    throw new RangeError(`price must be > 0 (got ${price})`);
  }
  return cost / price;
}

/** Markup achieved at a given price: (price − cost) / cost. */
export function markupOf(cost: number, price: number): number {
  if (cost <= 0) {
    throw new RangeError(`cost must be > 0 (got ${cost})`);
  }
  return (price - cost) / cost;
}

/** A margin counts as "low" when it falls below the configured threshold. */
export function isLowMargin(margin: number, thresholdMargin: number): boolean {
  return margin < thresholdMargin;
}

export type CharmStyle =
  | 'none'
  | 'ending99'
  | 'ending95'
  | 'whole'
  | 'ending900'
  | 'nearest100'
  | 'nearest500'
  | 'nearest1000';

/**
 * "Charm" rounding to psychologically attractive price points.
 *   - ending99/95 : $/€ style  (e.g. 4.99 / 4.95)
 *   - ending900   : ₩ style    (e.g. 4900)
 *   - nearestN    : round to the nearest N (₩ style, e.g. 100/500/1000)
 *   - whole       : nearest whole unit
 */
export function charmRound(price: number, style: CharmStyle): number {
  if (price <= 0 || !Number.isFinite(price)) return Math.max(0, price);
  switch (style) {
    case 'none':
      return price;
    case 'ending99':
      return Math.max(0, Math.ceil(price - 1e-9) - 0.01);
    case 'ending95':
      return Math.max(0, Math.ceil(price - 1e-9) - 0.05);
    case 'whole':
      return Math.round(price);
    case 'ending900':
      return Math.max(0, Math.ceil(price / 1000 - 1e-9) * 1000 - 100);
    case 'nearest100':
      return Math.round(price / 100) * 100;
    case 'nearest500':
      return Math.round(price / 500) * 500;
    case 'nearest1000':
      return Math.round(price / 1000) * 1000;
    default:
      return price;
  }
}
