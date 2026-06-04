import { describe, it, expect } from 'vitest';
import { hasFeature, canSaveDrink, requiredTier, FREE_DRINK_LIMIT } from './gate';

describe('feature gating', () => {
  it('maps features to the right tier', () => {
    expect(requiredTier('home.roi')).toBe('personal');
    expect(requiredTier('cafe.whatif')).toBe('cafe');
  });

  it('free unlocks nothing paid', () => {
    expect(hasFeature('free', 'home.roi')).toBe(false);
    expect(hasFeature('free', 'cafe.dashboard')).toBe(false);
  });

  it('personal unlocks home features only', () => {
    expect(hasFeature('personal', 'home.roi')).toBe(true);
    expect(hasFeature('personal', 'home.export')).toBe(true);
    expect(hasFeature('personal', 'cafe.dashboard')).toBe(false);
  });

  it('cafe is a superset (also unlocks home)', () => {
    expect(hasFeature('cafe', 'cafe.whatif')).toBe(true);
    expect(hasFeature('cafe', 'home.roi')).toBe(true);
  });

  it('enforces the free per-mode drink cap', () => {
    expect(canSaveDrink('free', 'home', FREE_DRINK_LIMIT - 1)).toBe(true);
    expect(canSaveDrink('free', 'home', FREE_DRINK_LIMIT)).toBe(false);
    expect(canSaveDrink('personal', 'home', 99)).toBe(true);
    // personal does NOT lift the café cap
    expect(canSaveDrink('personal', 'cafe', FREE_DRINK_LIMIT)).toBe(false);
    expect(canSaveDrink('cafe', 'cafe', 99)).toBe(true);
  });
});
