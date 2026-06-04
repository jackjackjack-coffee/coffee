import { describe, it, expect } from 'vitest';
import {
  laborCost,
  fixedOverhead,
  revenueOverhead,
  fullCost,
  priceFromMargin,
  priceFromMarginWithRevenueOverhead,
  priceFromMarkup,
  marginOf,
  costRatio,
  markupOf,
  isLowMargin,
  charmRound,
} from './pricing';

describe('labour & overhead (formula 3)', () => {
  it('labour = rate/min × minutes', () => {
    expect(laborCost(300, 2)).toBe(600);
  });

  it('fixed overhead only counts per-drink mode', () => {
    expect(fixedOverhead({ mode: 'perDrink', amount: 50 })).toBe(50);
    expect(fixedOverhead({ mode: 'pctRevenue', pct: 10 })).toBe(0);
    expect(fixedOverhead()).toBe(0);
  });

  it('revenue overhead is a % of price', () => {
    expect(revenueOverhead({ mode: 'pctRevenue', pct: 10 }, 2000)).toBe(200);
    expect(revenueOverhead({ mode: 'perDrink', amount: 50 }, 2000)).toBe(0);
  });

  it('full cost = COGS + labour + fixed + revenue%', () => {
    expect(fullCost(1000, 200, { mode: 'perDrink', amount: 50 }, 3000)).toBe(1250);
    expect(fullCost(1000, 0, { mode: 'pctRevenue', pct: 10 }, 2000)).toBe(1200);
  });
});

describe('pricing (formula 4)', () => {
  it('price = cost / (1 − margin)', () => {
    expect(priceFromMargin(1000, 0.6)).toBeCloseTo(2500, 6);
    expect(priceFromMargin(350, 0.7)).toBeCloseTo(1166.6667, 3);
  });

  it('round-trips margin and cost ratio', () => {
    const price = priceFromMargin(1000, 0.6);
    expect(marginOf(1000, price)).toBeCloseTo(0.6, 6);
    expect(costRatio(1000, price)).toBeCloseTo(0.4, 6);
  });

  it('markup pricing and inverse', () => {
    expect(priceFromMarkup(1000, 150)).toBe(2500);
    expect(markupOf(1000, 2500)).toBeCloseTo(1.5, 6);
  });

  it('folds revenue-% overhead into the denominator', () => {
    const price = priceFromMarginWithRevenueOverhead(1000, 0.6, 10);
    expect(price).toBeCloseTo(3333.3333, 3);
    // realised margin (after the revenue overhead) is back to the target
    const fc = fullCost(1000, 0, { mode: 'pctRevenue', pct: 10 }, price);
    expect(marginOf(fc, price)).toBeCloseTo(0.6, 6);
  });

  it('flags low margins', () => {
    expect(isLowMargin(0.5, 0.6)).toBe(true);
    expect(isLowMargin(0.7, 0.6)).toBe(false);
  });

  it('rejects impossible margins', () => {
    expect(() => priceFromMargin(1000, 1)).toThrow(RangeError);
    expect(() => priceFromMargin(1000, 1.2)).toThrow(RangeError);
    expect(() => marginOf(1000, 0)).toThrow(RangeError);
  });
});

describe('charm rounding', () => {
  it('ending99 sits just below the next whole unit', () => {
    expect(charmRound(4.3, 'ending99')).toBeCloseTo(4.99, 6);
    expect(charmRound(4.0, 'ending99')).toBeCloseTo(3.99, 6);
  });

  it('ending95 variant', () => {
    expect(charmRound(4.3, 'ending95')).toBeCloseTo(4.95, 6);
  });

  it('ending900 for KRW', () => {
    expect(charmRound(4300, 'ending900')).toBe(4900);
    expect(charmRound(4900, 'ending900')).toBe(4900);
  });

  it('nearest-N rounding', () => {
    expect(charmRound(4530, 'nearest100')).toBe(4500);
    expect(charmRound(4280, 'nearest500')).toBe(4500);
    expect(charmRound(4600, 'nearest1000')).toBe(5000);
  });

  it('whole and none', () => {
    expect(charmRound(4.6, 'whole')).toBe(5);
    expect(charmRound(4.37, 'none')).toBe(4.37);
  });
});
