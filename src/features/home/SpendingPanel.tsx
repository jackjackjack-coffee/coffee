import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { db } from '../../data/db';
import { addSpend, remove } from '../../data/repo';
import type { SpendEntry, SpendType } from '../../data/types';
import { useFormat } from '../../lib/hooks';
import { useT } from '../../i18n';
import { downloadCSV } from '../../lib/csv';
import { todayISO, lastNMonths, monthKey } from '../../lib/date';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { NumberField, SelectField, TextField } from '../../components/ui/fields';
import { Stat } from '../../components/ui/Stat';

const TYPES: SpendType[] = ['beans', 'equipment', 'cafe', 'other'];
const typeKey = (ty: SpendType) => `spend.${ty}` as const;

export function SpendingPanel() {
  const t = useT();
  const fmt = useFormat();
  const [adding, setAdding] = useState(false);

  const entries = useLiveQuery(() => db.spend.orderBy('date').reverse().toArray(), [], [] as SpendEntry[]);

  const year = new Date().getFullYear().toString();
  const month = monthKey(new Date());
  const yearTotal = entries.filter((e) => e.date.startsWith(year)).reduce((s, e) => s + e.amount, 0);
  const monthTotal = entries.filter((e) => e.date.startsWith(month)).reduce((s, e) => s + e.amount, 0);

  const months = lastNMonths(12);
  const trend = months.map((m) => ({
    label: m.slice(2),
    total: entries.filter((e) => e.date.startsWith(m)).reduce((s, e) => s + e.amount, 0),
  }));

  const exportCsv = () =>
    downloadCSV('coffee-spending', [
      [t('spend.date'), t('spend.type'), t('common.amount'), t('common.note')],
      ...entries.map((e) => [e.date, t(typeKey(e.type)), e.amount, e.note ?? '']),
    ]);

  return (
    <div className="space-y-4">
      <SectionTitle
        title={t('spend.title')}
        action={
          <div className="flex gap-2">
            {entries.length > 0 && (
              <Button variant="secondary" onClick={exportCsv}>
                {t('common.exportCsv')}
              </Button>
            )}
            <Button onClick={() => setAdding(true)}>+ {t('spend.add')}</Button>
          </div>
        }
      />

      <div className="grid grid-cols-2 gap-2">
        <Stat label={t('spend.month')} amount={monthTotal} format={fmt.money} />
        <Stat label={t('spend.year')} amount={yearTotal} format={fmt.money} />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon="🧾" text={t('spend.empty')} action={<Button onClick={() => setAdding(true)}>+ {t('spend.add')}</Button>} />
      ) : (
        <>
          <Card>
            <div className="mb-2 text-sm font-medium text-coffee-700">{t('spend.trend')}</div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trend} margin={{ top: 8, right: 8, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2350" vertical={false} />
                  <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#a99bd0' }} stroke="#3a3170" />
                  <YAxis tick={{ fontSize: 10, fill: '#a99bd0' }} width={44} tickFormatter={(v) => fmt.num(v / 1000) + 'k'} stroke="#3a3170" />
                  <Tooltip
                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    contentStyle={{ background: '#1b1233', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 12, color: '#f3eefc' }}
                    labelStyle={{ color: '#c4b5fd' }}
                    formatter={(v: number) => [fmt.money(v), t('common.total')]}
                  />
                  <Bar dataKey="total" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="divide-y divide-white/5 p-0">
            {entries.slice(0, 50).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <div>
                  <div className="text-sm font-medium text-coffee-800">{t(typeKey(e.type))}</div>
                  <div className="text-xs text-coffee-500">
                    {e.date}
                    {e.note ? ` · ${e.note}` : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-coffee-900 tnum">{fmt.money(e.amount)}</span>
                  <button
                    type="button"
                    aria-label={t('common.delete')}
                    onClick={() => remove.spend(e.id)}
                    className="text-coffee-300 hover:text-rose-400"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </Card>
        </>
      )}

      {adding && <SpendForm onClose={() => setAdding(false)} />}
    </div>
  );
}

function SpendForm({ onClose }: { onClose: () => void }) {
  const t = useT();
  const [date, setDate] = useState(todayISO());
  const [type, setType] = useState<SpendType>('beans');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [note, setNote] = useState('');

  const valid = date !== '' && (amount ?? 0) > 0;
  const save = async () => {
    if (!valid) return;
    await addSpend({ date, type, amount: amount ?? 0, ...(note.trim() ? { note: note.trim() } : {}) });
    onClose();
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={t('spend.add')}
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
            label={t('spend.type')}
            value={type}
            onChange={setType}
            options={TYPES.map((ty) => ({ value: ty, label: t(typeKey(ty)) }))}
          />
        </div>
        <NumberField label={t('common.amount')} value={amount} onChange={(v) => setAmount(v ?? undefined)} min={0} />
        <TextField label={`${t('common.note')} (${t('common.optional')})`} value={note} onChange={setNote} />
      </div>
    </Modal>
  );
}
