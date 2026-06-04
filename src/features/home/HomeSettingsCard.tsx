import { useLiveQuery } from 'dexie-react-hooks';
import { db, getHomeSettings } from '../../data/db';
import { saveHomeSettings } from '../../data/repo';
import type { HomeSettings } from '../../data/types';
import { useT } from '../../i18n';
import { Card } from '../../components/ui/Card';
import { NumberField } from '../../components/ui/fields';

const FALLBACK: HomeSettings = { id: 'home', cupsPerDay: 2, avgCafeCupPrice: 4500 };

export function useHomeSettings(): HomeSettings {
  return useLiveQuery(getHomeSettings, [], FALLBACK) ?? FALLBACK;
}

export function HomeSettingsCard() {
  const t = useT();
  const s = useLiveQuery(() => db.homeSettings.get('home'), [], FALLBACK) ?? FALLBACK;

  const patch = (p: Partial<HomeSettings>) => void saveHomeSettings({ ...s, ...p });

  return (
    <Card>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <NumberField
          label={t('home.cupsPerDay')}
          value={s.cupsPerDay}
          onChange={(v) => patch({ cupsPerDay: v ?? 0 })}
          min={0}
        />
        <NumberField
          label={t('home.cafePrice')}
          value={s.avgCafeCupPrice}
          onChange={(v) => patch({ avgCafeCupPrice: v ?? 0 })}
          min={0}
        />
        <NumberField
          label={`${t('home.electricity')} (${t('common.optional')})`}
          value={s.electricityPerCup}
          onChange={(v) => patch({ electricityPerCup: v ?? undefined })}
          min={0}
        />
        <NumberField
          label={`${t('home.water')} (${t('common.optional')})`}
          value={s.waterPerCup}
          onChange={(v) => patch({ waterPerCup: v ?? undefined })}
          min={0}
        />
      </div>
    </Card>
  );
}
