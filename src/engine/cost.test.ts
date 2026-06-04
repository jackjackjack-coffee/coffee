import { describe, it, expect } from 'vitest';
import {
  unitCost,
  itemCost,
  drinkCOGS,
  packagingCost,
  cogsBreakdown,
} from './cost';

describe('unitCost (formula 1)', () => {
  it('costs per gram from a kg purchase', () => {
    // ₩20,000 / 1000 g = ₩20 per gram
    expect(unitCost(1, 'kg', 20000)).toBe(20);
  });

  it('costs per ml from a litre purchase', () => {
    expect(unitCost(1, 'l', 1500)).toBe(1.5);
  });

  it('costs per each from a pack', () => {
    expect(unitCost(12, 'ea', 3600)).toBe(300);
  });

  it('rejects a zero purchase quantity (no divide by zero)', () => {
    expect(() => unitCost(0, 'g', 1000)).toThrow(RangeError);
  });

  it('rejects a negative price', () => {
    expect(() => unitCost(1, 'kg', -1)).toThrow(RangeError);
  });
});

describe('itemCost & drinkCOGS (formula 2)', () => {
  it('multiplies amount × unit cost', () => {
    // 20 g of beans at ₩20/g = ₩400
    expect(itemCost({ amount: 20, unit: 'g', unitCost: 20 })).toBe(400);
  });

  it('applies waste as a percentage', () => {
    // ₩400 × 1.05 = ₩420
    expect(itemCost({ amount: 20, unit: 'g', unitCost: 20, wastePct: 5 })).toBeCloseTo(420, 6);
  });

  it('converts the amount unit before costing', () => {
    // 0.2 L of milk at ₩2.5/ml = 200 ml × 2.5 = ₩500
    expect(itemCost({ amount: 0.2, unit: 'l', unitCost: 2.5 })).toBe(500);
  });

  it('sums ingredients plus packaging', () => {
    const cogs = drinkCOGS(
      [
        { amount: 20, unit: 'g', unitCost: 20 }, // 400
        { amount: 200, unit: 'ml', unitCost: 2.5 }, // 500
      ],
      { cup: 100 }, // 100
    );
    expect(cogs).toBe(1000);
  });

  it('sums all packaging components', () => {
    expect(packagingCost({ cup: 100, lid: 50, sleeve: 30, other: 20 })).toBe(200);
    expect(packagingCost()).toBe(0);
  });
});

describe('cogsBreakdown', () => {
  it('returns per-line shares that sum to 1', () => {
    const { total, lines, packaging } = cogsBreakdown(
      [
        { amount: 20, unit: 'g', unitCost: 20 }, // 400
        { amount: 200, unit: 'ml', unitCost: 2.5 }, // 500
      ],
      { cup: 100 },
    );
    expect(total).toBe(1000);
    expect(packaging).toBe(100);
    expect(lines[0]!.share).toBeCloseTo(0.4, 6);
    expect(lines[1]!.share).toBeCloseTo(0.5, 6);
    const shareSum = lines.reduce((s, l) => s + l.share, 0) + packaging / total;
    expect(shareSum).toBeCloseTo(1, 6);
  });
});
