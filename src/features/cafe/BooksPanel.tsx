import { useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../../data/db';
import { addExpense, addSale, remove } from '../../data/repo';
import type { Drink, ExpenseCategory, ExpenseEntry, Ingredient, SalesEntry } from '../../data/types';
import { indexById, resolveLines } from '../../store/selectors';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { downloadCSV } from '../../lib/csv';
import { lastNMonths, monthKey, todayISO } from '../../lib/date';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { NumberField, SelectField, TextField } from '../../components/ui/fields';
import { Stat } from '../../components/ui/Stat';
import { EXPENSE_CATEGORIES, expKey } from '../../lib/options';

type Period = 'month' | 'year' | 'all';

export function BooksPanel() {
  const t = useT();
  const fmt = useFormat();
  const [period, setPeriod] = useState<Period>('month');
  const [adding, setAdding] = useState<'sale' | 'expense' | null>(null);

  const drinks = useLiveQuery(() => db.drinks.where('mode').equals('cafe').toArray(), [], [] as Drink[]);
  const ingredients = useLiveQuery(() => db.ingredients.where('mode').equals('cafe').toArray(), [], [] as Ingredient[]);
  const sales = useLiveQuery(() => db.sales.toArray(), [], [] as SalesEntry[]);
  const expenses = useLiveQuery(() => db.expenses.toArray(), [], [] as ExpenseEntry[]);

  const ingById = useMemo(() => indexById(ingredients), [ingredients]);
  const drinkById = useMemo(() => indexById(drinks), [drinks]);
  const cogsOf = (drinkId: string): number => {
    const d = drinkById.get(drinkId);
    return d ? resolveLines(d, ingById).reduce((s, l) => s + l.lineCost, 0) : 0;
  };

  const prefix = period === 'month' ? monthKey(new Date()) : period === 'year' ? new Date().getFullYear().toString() : '';
  const inPeriod = (date: string) => date.startsWith(prefix);

  const periodSales = sales.filter((s) => inPeriod(s.date));
  const periodExpenses = expenses.filter((e) => inPeriod(e.date));
  const revenue = periodSales.reduce((s, e) => s + e.qty * e.unitPrice, 0);
  const cogs = periodSales.reduce((s, e) => s + e.qty * cogsOf(e.drinkId), 0);
  const otherCosts = periodExpenses.reduce((s, e) => s + e.amount, 0);
  const gross = revenue - cogs;
  const net = gross - otherCosts;

  const trend = useMemo(() => {
    return lastNMonths(6).map((m) => {
      const rev = sales.filter((s) => s.date.startsWith(m)).reduce((s, e) => s + e.qty * e.unitPrice, 0);
      const c = sales.filter((s) => s.date.startsWith(m)).reduce((s, e) => s + e.qty * cogsOf(e.drinkId), 0);
      const ex = expenses.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0);
      return { label: m.slice(2), revenue: Math.round(rev), profit: Math.round(rev - c - ex) };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sales, expenses, drinkById, ingById]);

  const exportCsv = () =>
    downloadCSV('cafe-sales', [
      [t('spend.date'), t('common.name'), t('books.qty'), t('books.unitPrice'), t('drink.cogs')],
      ...sales.map((s) => [s.date, drinkById.get(s.drinkId)?.name ?? s.drinkId, s.qty, s.unitPrice, Math.round(cogsOf(s.drinkId))]),
    ]);

  const hasData = sales.length > 0 || expenses.length > 0;

  return (
    <div className="space-y-4">
      <SectionTitle
        title={t('books.title')}
        action={
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setAdding('expense')}>
              + {t('books.expenses')}
            </Button>
            <Button onClick={() => setAdding('sale')}>+ {t('books.sales')}</Button>
          </div>
        }
      />

      <div className="flex gap-1 rounded-xl bg-coffee-100 p-1 text-sm">
        {(['month', 'year', 'all'] as Period[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            className={`flex-1 rounded-lg py-1.5 font-medium ${period === p ? 'bg-white text-coffee-900 shadow-sm' : 'text-coffee-600'}`}
          >
            {p === 'month' ? t('spend.month') : p === 'year' ? t('spend.year') : t('common.total')}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat label={t('books.revenue')} value={fmt.money(revenue)} />
        <Stat label={t('books.cogs')} value={fmt.money(cogs)} />
        <Stat label={t('books.grossProfit')} value={fmt.money(gross)} accent={gross >= 0 ? 'good' : 'bad'} />
        <Stat label={t('books.netProfit')} value={fmt.money(net)} accent={net >= 0 ? 'good' : 'bad'} sub={`− ${fmt.money(otherCosts)} ${t('books.otherCosts')}`} />
      </div>

      {!hasData ? (
        <EmptyState icon="📒" text={t('books.empty')} />
      ) : (
        <>
          <Card>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium text-coffee-700">{t('spend.trend')}</span>
              <Button variant="ghost" className="px-2 py-1 text-xs" onClick={exportCsv}>
                {t('common.exportCsv')}
              </Button>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eaddcf" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#a98a6d" />
                  <YAxis tick={{ fontSize: 10 }} width={44} tickFormatter={(v) => fmt.num(v / 1000) + 'k'} stroke="#a98a6d" />
                  <Tooltip formatter={(v: number, n) => [fmt.money(v), n === 'revenue' ? t('books.revenue') : t('books.netProfit')]} />
                  <Legend formatter={(v) => (v === 'revenue' ? t('books.revenue') : t('books.netProfit'))} wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey="revenue" fill="#d0ac8c" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#7c4730" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <RecentList
            sales={periodSales}
            expenses={periodExpenses}
            nameOf={(id) => drinkById.get(id)?.name ?? '—'}
          />
        </>
      )}

      {adding === 'sale' && <SaleForm drinks={drinks} onClose={() => setAdding(null)} />}
      {adding === 'expense' && <ExpenseForm onClose={() => setAdding(null)} />}
    </div>
  );
}

function RecentList({
  sales,
  expenses,
  nameOf,
}: {
  sales: SalesEntry[];
  expenses: ExpenseEntry[];
  nameOf: (id: string) => string;
}) {
  const t = useT();
  const fmt = useFormat();
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Card className="p-0">
        <div className="border-b border-coffee-100 px-4 py-2 text-xs font-semibold uppercase text-coffee-400">{t('books.sales')}</div>
        {sales.length === 0 ? (
          <div className="px-4 py-3 text-sm text-coffee-400">—</div>
        ) : (
          sales.slice(0, 30).map((s) => (
            <div key={s.id} className="flex items-center justify-between gap-2 border-b border-coffee-50 px-4 py-2 text-sm last:border-0">
              <div className="min-w-0">
                <div className="truncate font-medium text-coffee-800">{nameOf(s.drinkId)}</div>
                <div className="text-xs text-coffee-500">
                  {s.date} · {s.qty}×{fmt.money(s.unitPrice)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-coffee-900 tnum">{fmt.money(s.qty * s.unitPrice)}</span>
                <button type="button" className="text-coffee-300 hover:text-red-600" onClick={() => remove.sale(s.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
      <Card className="p-0">
        <div className="border-b border-coffee-100 px-4 py-2 text-xs font-semibold uppercase text-coffee-400">{t('books.expenses')}</div>
        {expenses.length === 0 ? (
          <div className="px-4 py-3 text-sm text-coffee-400">—</div>
        ) : (
          expenses.slice(0, 30).map((e) => (
            <div key={e.id} className="flex items-center justify-between gap-2 border-b border-coffee-50 px-4 py-2 text-sm last:border-0">
              <div className="min-w-0">
                <div className="truncate font-medium text-coffee-800">{t(expKey(e.category))}</div>
                <div className="text-xs text-coffee-500">
                  {e.date}
                  {e.note ? ` · ${e.note}` : ''}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-red-600 tnum">−{fmt.money(e.amount)}</span>
                <button type="button" className="text-coffee-300 hover:text-red-600" onClick={() => remove.expense(e.id)}>
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

function SaleForm({ drinks, onClose }: { drinks: Drink[]; onClose: () => void }) {
  const t = useT();
  const [date, setDate] = useState(todayISO());
  const [drinkId, setDrinkId] = useState(drinks[0]?.id ?? '');
  const [qty, setQty] = useState<number | undefined>(1);
  const drink = drinks.find((d) => d.id === drinkId);
  const [unitPrice, setUnitPrice] = useState<number | undefined>(drink?.sellPrice);

  const valid = drinkId !== '' && (qty ?? 0) > 0 && (unitPrice ?? 0) >= 0;
  const save = async () => {
    if (!valid) return;
    await addSale({ date, drinkId, qty: qty ?? 0, unitPrice: unitPrice ?? 0 });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('books.addSale')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} disabled={!valid}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <TextField label={t('spend.date')} value={date} onChange={setDate} />
        <SelectField
          label={t('drink.titleCafe')}
          value={drinkId}
          onChange={(v) => {
            setDrinkId(v);
            setUnitPrice(drinks.find((d) => d.id === v)?.sellPrice);
          }}
          options={drinks.map((d) => ({ value: d.id, label: d.name }))}
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberField label={t('books.qty')} value={qty} onChange={(v) => setQty(v ?? undefined)} min={0} />
          <NumberField label={t('books.unitPrice')} value={unitPrice} onChange={(v) => setUnitPrice(v ?? undefined)} min={0} />
        </div>
      </div>
    </Modal>
  );
}

function ExpenseForm({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState<ExpenseCategory>('rent');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');

  const valid = (amount ?? 0) > 0;
  const save = async () => {
    if (!valid) return;
    await addExpense({ date, category, amount: amount ?? 0, ...(note.trim() ? { note: note.trim() } : {}) });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('books.addExpense')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button onClick={save} disabled={!valid}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <TextField label={t('spend.date')} value={date} onChange={setDate} />
          <SelectField
            label={t('common.category')}
            value={category}
            onChange={setCategory}
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: t(expKey(c)) }))}
          />
        </div>
        <NumberField label={t('common.amount')} value={amount} onChange={(v) => setAmount(v ?? undefined)} min={0} />
        <TextField label={`${t('common.note')} (${t('common.optional')})`} value={note} onChange={setNote} />
      </div>
    </Modal>
  );
}
