import { useMemo } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import type { Drink, Ingredient } from '../../data/types';
import { cafeDrinkEconomics, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { downloadCSV } from '../../lib/csv';
import { exportTablePDF } from '../../lib/pdf';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LockedFeature } from '../../components/ui/Pro';
import { Stat } from '../../components/ui/Stat';
import { useActiveMenu } from './useMenus';

export function CafeDashboard() {
  const t = useT();
  const fmt = useFormat();
  const menu = useActiveMenu();

  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('cafe').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('cafe').toArray(), [], [] as Ingredient[]);
  const ingById = useMemo(() => indexById(ingredients), [ingredients]);

  const rows = useMemo(() => {
    if (!menu) return [];
    return drinks
      .map((d) => ({ drink: d, e: cafeDrinkEconomics(d, menu, ingById) }))
      .sort((a, b) => a.e.margin - b.e.margin);
  }, [drinks, menu, ingById]);

  if (!menu) return null;

  const avgMargin = rows.length ? rows.reduce((s, r) => s + r.e.margin, 0) / rows.length : 0;
  const avgCogs = rows.length ? rows.reduce((s, r) => s + r.e.cogs, 0) / rows.length : 0;
  const flagged = rows.filter((r) => r.e.isLowMargin).length;

  const exportCsv = () =>
    downloadCSV('menu-profitability', [
      [t('common.name'), t('drink.cogs'), t('drink.fullCost'), t('drink.sellPrice'), t('drink.margin'), t('drink.costRatio')],
      ...rows.map((r) => [
        r.drink.name,
        Math.round(r.e.cogs),
        Math.round(r.e.fullCost),
        Math.round(r.e.price),
        (r.e.margin * 100).toFixed(1) + '%',
        (r.e.costRatio * 100).toFixed(1) + '%',
      ]),
    ]);

  const exportPdf = () =>
    exportTablePDF({
      title: 'Menu Profitability',
      subtitle: menu.name,
      head: ['Drink', 'COGS', 'Full cost', 'Price', 'Margin', 'Cost%'],
      body: rows.map((r) => [
        r.drink.name,
        Math.round(r.e.cogs),
        Math.round(r.e.fullCost),
        Math.round(r.e.price),
        (r.e.margin * 100).toFixed(1) + '%',
        (r.e.costRatio * 100).toFixed(1) + '%',
      ]),
      filename: 'menu-profitability',
    });

  return (
    <div className="space-y-4">
      <SectionTitle title={t('cafe.dash.title')} subtitle={menu.name} />

      {drinks.length === 0 ? (
        <EmptyState icon="📊" text={t('cafe.dash.empty')} />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Stat label={t('cafe.dash.avgMargin')} value={fmt.pct(avgMargin)} />
            <Stat label={t('cafe.dash.avgCost')} value={fmt.money(avgCogs)} />
            <Stat label={t('common.count', { n: rows.length })} value={fmt.num(rows.length)} />
            <Stat
              label={t('drink.lowMargin')}
              value={fmt.num(flagged)}
              accent={flagged > 0 ? 'bad' : 'good'}
              sub={flagged > 0 ? t('cafe.dash.flagged', { n: flagged }) : undefined}
            />
          </div>

          <LockedFeature feature="cafe.dashboard">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-coffee-100 px-3 py-2">
                <span className="text-xs font-semibold uppercase text-coffee-400">{t('cafe.dash.sortMargin')}</span>
                <div className="flex gap-2">
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={exportCsv}>
                    CSV
                  </Button>
                  <Button variant="ghost" className="px-2 py-1 text-xs" onClick={exportPdf}>
                    PDF
                  </Button>
                </div>
              </div>
              {rows.map((r) => (
                <div
                  key={r.drink.id}
                  className={`grid grid-cols-12 items-center gap-2 border-b border-coffee-50 px-3 py-2 last:border-0 ${
                    r.e.isLowMargin ? 'bg-red-50' : ''
                  }`}
                >
                  <div className="col-span-4 min-w-0 truncate text-sm font-medium text-coffee-900">{r.drink.name}</div>
                  <div className="col-span-2 text-right text-sm text-coffee-600 tnum">{fmt.money(r.e.cogs)}</div>
                  <div className="col-span-2 text-right text-sm text-coffee-600 tnum">{fmt.money(r.e.price)}</div>
                  <div className="col-span-2 text-right text-xs text-coffee-500 tnum">{fmt.pct(r.e.costRatio)}</div>
                  <div
                    className={`col-span-2 text-right text-sm font-bold tnum ${
                      r.e.isLowMargin ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {fmt.pct(r.e.margin)}
                  </div>
                </div>
              ))}
            </Card>
          </LockedFeature>
        </>
      )}
    </div>
  );
}
