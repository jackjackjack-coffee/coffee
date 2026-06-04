import { describe, it, expect } from 'vitest';
import {
  lifespanInCups,
  depreciationPerCup,
  depreciationPerCupFor,
  trueCostPerCup,
  totalDepreciationPerCup,
} from './equipment';

describe('lifespan (formula 5)', () => {
  it('prefers an explicit cup lifespan', () => {
    expect(lifespanInCups({ lifespanCups: 10000 })).toBe(10000);
  });

  it('derives cups from years × cups/day × 365', () => {
    expect(lifespanInCups({ lifespanYears: 5, cupsPerDay: 2 })).toBe(3650);
  });

  it('throws when it cannot resolve a lifespan', () => {
    expect(() => lifespanInCups({})).toThrow(RangeError);
    expect(() => lifespanInCups({ lifespanYears: 5 })).toThrow(RangeError);
  });
});

describe('depreciation (formula 5)', () => {
  it('spreads price across the lifespan', () => {
    expect(depreciationPerCup(500000, 10000)).toBe(50);
  });

  it('works straight from a lifespan input', () => {
    expect(depreciationPerCupFor(500000, { lifespanYears: 5, cupsPerDay: 2 })).toBeCloseTo(
      136.9863,
      3,
    );
  });

  it('rejects a zero lifespan', () => {
    expect(() => depreciationPerCup(500000, 0)).toThrow(RangeError);
  });
});

describe('true cost per cup (formula 6)', () => {
  it('adds consumables + depreciation', () => {
    expect(
      trueCostPerCup({ consumablePerCup: 500, depreciationPerCup: 50 }),
    ).toBe(550);
  });

  it('includes optional electricity & water', () => {
    expect(
      trueCostPerCup({
        consumablePerCup: 500,
        depreciationPerCup: 50,
        electricityPerCup: 10,
        waterPerCup: 5,
      }),
    ).toBe(565);
  });

  it('sums depreciation across multiple machines', () => {
    expect(
      totalDepreciationPerCup([
        { price: 500000, lifespan: { lifespanCups: 10000 } }, // 50
        { price: 200000, lifespan: { lifespanCups: 20000 } }, // 10
      ]),
    ).toBe(60);
  });
});
