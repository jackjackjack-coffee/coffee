import { useAppStore } from '../../store/useAppStore';
import { LockedFeature } from '../../components/ui/Pro';
import { IngredientsManager } from '../shared/IngredientsManager';
import { DrinksManager } from '../shared/DrinksManager';
import { SettingsPanel } from '../settings/SettingsPanel';
import { CafeDashboard } from './CafeDashboard';
import { PricingPanel } from './PricingPanel';
import { MenusPanel } from './MenusPanel';
import { WhatIfPanel } from './WhatIfPanel';
import { BooksPanel } from './BooksPanel';
import { useActiveMenu } from './useMenus';

function CafeDrinks() {
  const menu = useActiveMenu();
  return <DrinksManager mode="cafe" {...(menu ? { activeMenu: menu } : {})} />;
}

export function CafeApp() {
  const section = useAppStore((s) => s.cafeSection);

  switch (section) {
    case 'dashboard':
      return <CafeDashboard />;
    case 'ingredients':
      return <IngredientsManager mode="cafe" />;
    case 'drinks':
      return <CafeDrinks />;
    case 'pricing':
      return <PricingPanel />;
    case 'menus':
      return (
        <LockedFeature feature="cafe.menus">
          <MenusPanel />
        </LockedFeature>
      );
    case 'whatif':
      return (
        <LockedFeature feature="cafe.whatif">
          <WhatIfPanel />
        </LockedFeature>
      );
    case 'books':
      return (
        <LockedFeature feature="cafe.books">
          <BooksPanel />
        </LockedFeature>
      );
    case 'settings':
      return <SettingsPanel />;
    default:
      return <CafeDashboard />;
  }
}
