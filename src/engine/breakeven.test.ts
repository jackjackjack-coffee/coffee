import { describe, it, expect } from 'vitest';
import {
  savingsPerCup,
  breakevenCups,
  breakeven,
  roiCurve,
  suggestRoiMonths,
} from './breakeven';

describe('savings & break-even (formula 7)', () => {
  it('saving per cup = cafe − home', () => {
    expect(savingsPerCup(4500, 500)).toBe(4000);
  });

  it('cups to recover the equipment price', () => {
    expect(breakevenCups(500000, 4000)).toBe(125);
  });

  it('never breaks even when there is no saving', () => {
    expect(breakevenCups(500000, 0)).toBe(Infinity);
    expect(breakevenCups(500000, -100)).toBe(Infinity);
  });

  it('computes a full break-even result', () => {
    const r = breakeven({
      equipmentPrice: 500000,
      cafePrice: 4500,
      homeConsumablePerCup: 500,
      cupsPerDay: 2,
    });
    expect(r.perCupSaving).toBe(4000);
    expect(r.breakevenCups).toBe(125);
    expect(r.breakevenDays).toBeCloseTo(62.5, 6);
    expect(r.breakevenMonths).toBeCloseTo(2.0534, 3);
    expect(r.annualSavingsAfterBreakeven).toBe(2920000); // 4000 × 2 × 365
    expect(r.neverBreaksEven).toBe(false);
  });

  it('marks never-breaks-even when home costs more than a cafe', () => {
    const r = breakeven({
      equipmentPrice: 500000,
      cafePrice: 1000,
      homeConsumablePerCup: 1500,
      cupsPerDay: 2,
    });
    expect(r.neverBreaksEven).toBe(true);
    expect(r.breakevenCups).toBe(Infinity);
    expect(r.annualSavingsAfterBreakeven).toBe(0);
  });
});

describe('ROI curve', () => {
  const input = {
    equipmentPrice: 500000,
    cafePrice: 4500,
    homeConsumablePerCup: 500,
    cupsPerDay: 2,
  };

  it('starts under water by exactly the equipment price', () => {
    const pts = roiCurve(input, { months: 6 });
    expect(pts[0]!.net).toBe(-500000);
    expect(pts[0]!.cups).toBe(0);
  });

  it('increases monotonically and crosses zero after break-even', () => {
    const pts = roiCurve(input, { months: 6 });
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i]!.net).toBeGreaterThan(pts[i - 1]!.net);
    }
    // break-even ≈ 2.05 months, so month 2 is still negative, month 3 positive
    expect(pts[2]!.net).toBeLessThan(0);
    expect(pts[3]!.net).toBeGreaterThan(0);
  });

  it('suggests a readable horizon', () => {
    const r = breakeven(input);
    expect(suggestRoiMonths(r)).toBe(6); // ceil(2.05 × 1.5)=4, clamped up to 6
    expect(suggestRoiMonths({ ...r, neverBreaksEven: true })).toBe(24);
  });
});
