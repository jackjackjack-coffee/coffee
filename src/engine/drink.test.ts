import { describe, it, expect } from 'vitest';
import { composeDrinkEconomics } from './drink';

describe('composeDrinkEconomics', () => {
  const latte = {
    items: [
      { amount: 20, unit: 'g' as const, unitCost: 20 }, // 400
      { amount: 200, unit: 'ml' as const, unitCost: 2.5 }, // 500
    ],
    packaging: { cup: 100 }, // 100  -> COGS 1000
    labor: { laborCostPerMin: 300, prepMinutes: 2 }, // 600
    overhead: { mode: 'perDrink' as const, amount: 50 },
    pricing: { targetMargin: 0.6, charm: 'none' as const, flagThresholdMargin: 0.5 },
  };

  it('builds COGS, full cost and a suggested price at the target margin', () => {
    const r = composeDrinkEconomics(latte);
    expect(r.cogs).toBe(1000);
    expect(r.labor).toBe(600);
    expect(r.fixedOverhead).toBe(50);
    expect(r.marginBaseCost).toBe(1650);
    expect(r.suggestedPrice).toBeCloseTo(4125, 6); // 1650 / 0.4
    expect(r.margin).toBeCloseTo(0.6, 6);
    expect(r.costRatio).toBeCloseTo(1000 / 4125, 6);
    expect(r.profit).toBeCloseTo(2475, 6);
    expect(r.isLowMargin).toBe(false);
  });

  it('uses an explicit price and flags a thin margin', () => {
    const r = composeDrinkEconomics({ ...latte, price: 2000 });
    expect(r.price).toBe(2000);
    expect(r.fullCost).toBe(1650);
    expect(r.margin).toBeCloseTo(0.175, 6);
    expect(r.isLowMargin).toBe(true);
  });

  it('handles revenue-% overhead', () => {
    const r = composeDrinkEconomics({
      items: [{ amount: 50, unit: 'g', unitCost: 20 }], // COGS 1000
      overhead: { mode: 'pctRevenue', pct: 10 },
      pricing: { targetMargin: 0.6, charm: 'none' },
    });
    expect(r.suggestedPrice).toBeCloseTo(3333.3333, 3);
    expect(r.margin).toBeCloseTo(0.6, 6);
  });

  it('charm rounding nudges the realised margin', () => {
    const r = composeDrinkEconomics({
      items: [{ amount: 50, unit: 'g', unitCost: 20 }], // COGS 1000
      pricing: { targetMargin: 0.6, charm: 'ending900' },
    });
    // raw 2500 -> charm 2900, so the realised margin is a touch higher
    expect(r.suggestedPriceRaw).toBeCloseTo(2500, 6);
    expect(r.suggestedPrice).toBe(2900);
    expect(r.margin).toBeGreaterThan(0.6);
  });
});
