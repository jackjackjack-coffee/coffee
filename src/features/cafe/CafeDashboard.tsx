import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useLiveQuery } from 'dexie-react-hooks';
import { CircleDollarSign, Download, Layers, Percent, TriangleAlert } from 'lucide-react';
import { db } from '../../data/db';
import type { Drink, Ingredient } from '../../data/types';
import { cafeDrinkEconomics, indexById } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { downloadCSV } from '../../lib/csv';
import { exportTablePDF } from '../../lib/pdf';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { LockedFeature } from '../../components/ui/Pro';
import { Stat } from '../../components/ui/Stat';
import { AnimatedNumber } from '../../components/ui/AnimatedNumber';
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
    <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-5">
      <SectionTitle title={t('cafe.dash.title')} subtitle={menu.name} />

      {drinks.length === 0 ? (
        <EmptyState icon="📊" text={t('cafe.dash.empty')} />
      ) : (
        <>
          <motion.div variants={fadeUp} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat
              icon={Percent}
              label={t('cafe.dash.avgMargin')}
              value={<AnimatedNumber value={avgMargin * 100} format={(n) => fmt.pct(n / 100)} />}
            />
            <Stat
              icon={CircleDollarSign}
              label={t('cafe.dash.avgCost')}
              value={<AnimatedNumber value={avgCogs} format={fmt.money} />}
            />
            <Stat
              icon={Layers}
              label={t('common.count', { n: rows.length })}
              value={<AnimatedNumber value={rows.length} format={(n) => fmt.num(Math.round(n))} />}
            />
            <Stat
              icon={TriangleAlert}
              label={t('drink.lowMargin')}
              value={<AnimatedNumber value={flagged} format={(n) => fmt.num(Math.round(n))} />}
              accent={flagged > 0 ? 'bad' : 'good'}
              sub={flagged > 0 ? t('cafe.dash.flagged', { n: flagged }) : undefined}
            />
          </motion.div>

          <motion.div variants={fadeUp}>
            <LockedFeature feature="cafe.dashboard">
              <Card className="p-0">
                <div className="flex items-center justify-between border-b border-coffee-100 px-4 py-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-coffee-400">
                    {t('cafe.dash.sortMargin')}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="ghost" className="gap-1.5 px-2 py-1 text-xs" onClick={exportCsv}>
                      <Download className="h-3.5 w-3.5" strokeWidth={2.2} /> CSV
                    </Button>
                    <Button variant="ghost" className="gap-1.5 px-2 py-1 text-xs" onClick={exportPdf}>
                      <Download className="h-3.5 w-3.5" strokeWidth={2.2} /> PDF
                    </Button>
                  </div>
                </div>
                <motion.div variants={staggerContainer} initial="hidden" animate="show">
                  {rows.map((r) => (
                    <motion.div
                      key={r.drink.id}
                      variants={fadeUp}
                      className={`grid grid-cols-12 items-center gap-2 border-b border-coffee-50 px-4 py-2.5 transition-colors last:border-0 hover:bg-coffee-50/60 ${
                        r.e.isLowMargin ? 'bg-red-50/70' : ''
                      }`}
                    >
                      <div className="col-span-4 min-w-0">
                        <div className="truncate text-sm font-medium text-coffee-900">{r.drink.name}</div>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-coffee-100">
                          <div
                            className={`h-full rounded-full ${r.e.isLowMargin ? 'bg-red-400' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.max(4, Math.min(100, r.e.margin * 100))}%` }}
                          />
                        </div>
                      </div>
                      <div className="col-span-3 text-right text-sm text-coffee-600 tnum">{fmt.money(r.e.cogs)}</div>
                      <div className="col-span-2 text-right text-sm text-coffee-600 tnum">{fmt.money(r.e.price)}</div>
                      <div
                        className={`col-span-3 text-right text-sm font-bold tnum ${
                          r.e.isLowMargin ? 'text-red-600' : 'text-emerald-700'
                        }`}
                      >
                        {fmt.pct(r.e.margin)}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </Card>
            </LockedFeature>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}
