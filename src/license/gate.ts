/** Feature gating derived from the active license tier. Pure, easy to test. */

import type { LicenseTier, Mode } from '../data/types';

export type Feature =
  // Home (Personal Pro)
  | 'home.roi'
  | 'home.spending'
  | 'home.export'
  | 'home.unlimited'
  // Café (Café Pro)
  | 'cafe.dashboard'
  | 'cafe.whatif'
  | 'cafe.menus'
  | 'cafe.books'
  | 'cafe.export'
  | 'cafe.unlimited'
  | 'cafe.multicurrency';

/** Free plan saves up to this many drinks per mode. */
export const FREE_DRINK_LIMIT = 5;

/** Which paid tier a feature belongs to. */
export function requiredTier(feature: Feature): Exclude<LicenseTier, 'free'> {
  return feature.startsWith('home.') ? 'personal' : 'cafe';
}

/**
 * Café Pro is the higher tier and is treated as a superset that also unlocks
 * Home Pro features; Personal Pro unlocks only Home features.
 */
export function hasFeature(tier: LicenseTier, feature: Feature): boolean {
  const need = requiredTier(feature);
  if (need === 'personal') return tier === 'personal' || tier === 'cafe';
  return tier === 'cafe';
}

/** Whether another drink can be saved under the free-tier per-mode cap. */
export function canSaveDrink(tier: LicenseTier, mode: Mode, currentCount: number): boolean {
  const unlimited = mode === 'home' ? 'home.unlimited' : 'cafe.unlimited';
  if (hasFeature(tier, unlimited)) return true;
  return currentCount < FREE_DRINK_LIMIT;
}
