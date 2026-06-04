import { upsertMenu } from '../../data/repo';
import type { Menu, MenuPricing } from '../../data/types';
import type { CharmStyle, OverheadMode } from '../../engine/pricing';
import { useT } from '../../i18n';
import { CHARM_STYLES, charmKey } from '../../lib/options';
import { Card } from '../../components/ui/Card';
import { NumberField, SelectField } from '../../components/ui/fields';
import { Info } from '../../components/ui/Info';

function save(menu: Menu, pricing: Partial<MenuPricing>): void {
  void upsertMenu({ ...menu, pricing: { ...menu.pricing, ...pricing } });
}

export function MenuPricingControls({ menu }: { menu: Menu }) {
  const t = useT();
  const p = menu.pricing;
  const overheadMode: OverheadMode = p.overhead.mode;

  return (
    <Card className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label={t('price.targetMargin')}
          value={Math.round(p.targetMargin * 100)}
          onChange={(v) => save(menu, { targetMargin: clampFrac((v ?? 0) / 100) })}
          min={0}
          suffix="%"
        />
        <NumberField
          label={t('price.flagThreshold')}
          value={Math.round(p.flagThresholdMargin * 100)}
          onChange={(v) => save(menu, { flagThresholdMargin: clampFrac((v ?? 0) / 100) })}
          min={0}
          suffix="%"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NumberField
          label={t('price.laborPerMin')}
          value={p.laborCostPerMin}
          onChange={(v) => save(menu, { laborCostPerMin: v ?? 0 })}
          min={0}
        />
        <SelectField
          label={t('price.charm')}
          value={p.charm}
          onChange={(c) => save(menu, { charm: c as CharmStyle })}
          options={CHARM_STYLES.map((c) => ({ value: c, label: t(charmKey(c)) }))}
        />
      </div>
      <div>
        <span className="label">
          {t('price.overhead')}
          <Info text={t('price.overhead.pctRevenue')} />
        </span>
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            value={overheadMode}
            onChange={(m) =>
              save(menu, {
                overhead:
                  (m as OverheadMode) === 'perDrink'
                    ? { mode: 'perDrink', amount: 0 }
                    : { mode: 'pctRevenue', pct: 10 },
              })
            }
            options={[
              { value: 'perDrink', label: t('price.overhead.perDrink') },
              { value: 'pctRevenue', label: t('price.overhead.pctRevenue') },
            ]}
          />
          {p.overhead.mode === 'perDrink' ? (
            <NumberField
              value={p.overhead.amount}
              onChange={(v) => save(menu, { overhead: { mode: 'perDrink', amount: v ?? 0 } })}
              min={0}
            />
          ) : (
            <NumberField
              value={p.overhead.pct}
              onChange={(v) => save(menu, { overhead: { mode: 'pctRevenue', pct: v ?? 0 } })}
              min={0}
              suffix="%"
            />
          )}
        </div>
      </div>
    </Card>
  );
}

function clampFrac(f: number): number {
  if (!Number.isFinite(f)) return 0;
  return Math.min(0.99, Math.max(0, f));
}
