/**
 * Higher-level composition of the per-formula primitives.
 *
 * The UI/store resolves ingredient unit costs first, then hands this module
 * plain numbers. Still 100% pure — no DB, no formatting.
 */

import {
  drinkCOGS,
  type DrinkItemInput,
  type PackagingInput,
} from './cost';
import {
  charmRound,
  costRatio,
  fixedOverhead,
  fullCost,
  isLowMargin,
  laborCost,
  marginOf,
  priceFromMargin,
  priceFromMarginWithRevenueOverhead,
  type CharmStyle,
  type Overhead,
} from './pricing';

export interface DrinkEconomicsInput {
  items: DrinkItemInput[];
  packaging?: PackagingInput;
  labor?: { laborCostPerMin: number; prepMinutes: number };
  overhead?: Overhead;
  pricing?: {
    /** Target margin as a fraction (0.65 = 65%). */
    targetMargin: number;
    charm?: CharmStyle;
    /** Margin below this (fraction) raises the low-margin flag. */
    flagThresholdMargin?: number;
  };
  /** Actual selling price; when set it overrides the suggested price. */
  price?: number;
}

export interface DrinkEconomicsResult {
  cogs: number;
  labor: number;
  fixedOverhead: number;
  /** Cost base the target margin is applied to. */
  marginBaseCost: number;
  /** Raw suggested price before charm rounding. */
  suggestedPriceRaw: number;
  /** Suggested price after charm rounding. */
  suggestedPrice: number;
  /** Effective price actually used (explicit price or the suggested one). */
  price: number;
  /** Full cost at the effective price (includes revenue-% overhead). */
  fullCost: number;
  /** Profit per drink at the effective price. */
  profit: number;
  /** Net margin at the effective price (after labour + overhead). */
  margin: number;
  /** Food-cost ratio: COGS / price. */
  costRatio: number;
  isLowMargin: boolean;
}

const DEFAULT_TARGET_MARGIN = 0.65;
const DEFAULT_CHARM: CharmStyle = 'none';

export function composeDrinkEconomics(input: DrinkEconomicsInput): DrinkEconomicsResult {
  const cogs = drinkCOGS(input.items, input.packaging);
  const labor = input.labor
    ? laborCost(input.labor.laborCostPerMin, input.labor.prepMinutes)
    : 0;
  const fixed = fixedOverhead(input.overhead);

  const targetMargin = input.pricing?.targetMargin ?? DEFAULT_TARGET_MARGIN;
  const charm = input.pricing?.charm ?? DEFAULT_CHARM;
  const overheadPct =
    input.overhead?.mode === 'pctRevenue' ? input.overhead.pct : 0;

  // Cost base for the margin: COGS + labour + fixed overhead. Revenue-% overhead
  // is folded into the pricing denominator instead.
  const marginBaseCost = cogs + labor + fixed;

  const suggestedPriceRaw =
    overheadPct > 0
      ? priceFromMarginWithRevenueOverhead(marginBaseCost, targetMargin, overheadPct)
      : priceFromMargin(marginBaseCost, targetMargin);
  const suggestedPrice = charmRound(suggestedPriceRaw, charm);

  const price = input.price !== undefined && input.price > 0 ? input.price : suggestedPrice;

  const fc = fullCost(cogs, labor, input.overhead, price);
  const margin = price > 0 ? marginOf(fc, price) : 0;
  const ratio = price > 0 ? costRatio(cogs, price) : 0;
  const threshold = input.pricing?.flagThresholdMargin;

  return {
    cogs,
    labor,
    fixedOverhead: fixed,
    marginBaseCost,
    suggestedPriceRaw,
    suggestedPrice,
    price,
    fullCost: fc,
    profit: price - fc,
    margin,
    costRatio: ratio,
    isLowMargin: threshold !== undefined ? isLowMargin(margin, threshold) : false,
  };
}
