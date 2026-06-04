import { useAppStore } from '../../store/useAppStore';
import { LockedFeature } from '../../components/ui/Pro';
import { IngredientsManager } from '../shared/IngredientsManager';
import { DrinksManager } from '../shared/DrinksManager';
import { SettingsPanel } from '../settings/SettingsPanel';
import { HomeDashboard } from './HomeDashboard';
import { EquipmentPanel } from './EquipmentPanel';
import { RoiPanel } from './RoiPanel';
import { SpendingPanel } from './SpendingPanel';

export function HomeApp() {
  const section = useAppStore((s) => s.homeSection);

  switch (section) {
    case 'dashboard':
      return <HomeDashboard />;
    case 'supplies':
      return <IngredientsManager mode="home" />;
    case 'recipes':
      return <DrinksManager mode="home" />;
    case 'equipment':
      return <EquipmentPanel />;
    case 'roi':
      return (
        <LockedFeature feature="home.roi">
          <RoiPanel />
        </LockedFeature>
      );
    case 'spending':
      return (
        <LockedFeature feature="home.spending">
          <SpendingPanel />
        </LockedFeature>
      );
    case 'settings':
      return <SettingsPanel />;
    default:
      return <HomeDashboard />;
  }
}
