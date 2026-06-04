import type { TKey } from '../i18n';
import type { Feature } from '../license/gate';
import type { CafeSection, HomeSection } from '../store/useAppStore';

export interface SectionDef<S extends string> {
  id: S;
  tKey: TKey;
  /** When set, the section is a Pro feature and shows a lock until unlocked. */
  feature?: Feature;
}

export const HOME_SECTIONS: SectionDef<HomeSection>[] = [
  { id: 'dashboard', tKey: 'nav.home.dashboard' },
  { id: 'supplies', tKey: 'nav.home.supplies' },
  { id: 'recipes', tKey: 'nav.home.recipes' },
  { id: 'equipment', tKey: 'nav.home.equipment' },
  { id: 'roi', tKey: 'nav.home.roi', feature: 'home.roi' },
  { id: 'spending', tKey: 'nav.home.spending', feature: 'home.spending' },
  { id: 'settings', tKey: 'nav.home.settings' },
];

export const CAFE_SECTIONS: SectionDef<CafeSection>[] = [
  { id: 'dashboard', tKey: 'nav.cafe.dashboard' },
  { id: 'ingredients', tKey: 'nav.cafe.ingredients' },
  { id: 'drinks', tKey: 'nav.cafe.drinks' },
  { id: 'pricing', tKey: 'nav.cafe.pricing' },
  { id: 'menus', tKey: 'nav.cafe.menus', feature: 'cafe.menus' },
  { id: 'whatif', tKey: 'nav.cafe.whatif', feature: 'cafe.whatif' },
  { id: 'books', tKey: 'nav.cafe.books', feature: 'cafe.books' },
  { id: 'settings', tKey: 'nav.cafe.settings' },
];
