import { useState } from 'react';
import { upsertMenu, remove } from '../../data/repo';
import type { Menu } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';
import { useT } from '../../i18n';
import { cn } from '../../lib/cn';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { TextField } from '../../components/ui/fields';
import { MenuPricingControls } from './MenuPricingControls';
import { useActiveMenu, useMenus } from './useMenus';

export function MenusPanel() {
  const t = useT();
  const menus = useMenus();
  const active = useActiveMenu();
  const setActiveMenuId = useAppStore((s) => s.setActiveMenuId);

  const addMenu = async () => {
    const base = active?.pricing;
    const id = await upsertMenu({
      name: `${t('menu.title')} ${menus.length + 1}`,
      drinkIds: [],
      pricing: base ?? {
        targetMargin: 0.7,
        flagThresholdMargin: 0.6,
        laborCostPerMin: 170,
        overhead: { mode: 'perDrink', amount: 0 },
        charm: 'ending900',
      },
    });
    setActiveMenuId(id);
  };

  return (
    <div className="space-y-4">
      <SectionTitle title={t('menu.title')} action={<Button onClick={addMenu}>+ {t('menu.add')}</Button>} />

      <div className="space-y-2">
        {menus.map((m) => (
          <MenuRow
            key={m.id}
            menu={m}
            active={active?.id === m.id}
            canDelete={!m.isDefault && menus.length > 1}
            onSelect={() => setActiveMenuId(m.id)}
            onDelete={async () => {
              if (confirm(t('common.confirmDelete'))) {
                await remove.menu(m.id);
                if (active?.id === m.id) setActiveMenuId(null);
              }
            }}
          />
        ))}
      </div>

      {active && (
        <div>
          <div className="mb-1 px-1 text-xs font-semibold uppercase tracking-wide text-coffee-400">
            {t('price.title')} · {active.name}
          </div>
          <MenuPricingControls menu={active} />
        </div>
      )}
    </div>
  );
}

function MenuRow({
  menu,
  active,
  canDelete,
  onSelect,
  onDelete,
}: {
  menu: Menu;
  active: boolean;
  canDelete: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  const t = useT();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(menu.name);

  return (
    <Card className={cn('flex items-center justify-between gap-3 p-3', active && 'ring-2 ring-violet-400')}>
      <button type="button" onClick={onSelect} className="flex flex-1 items-center gap-3 text-left">
        <span
          className={cn(
            'flex h-4 w-4 items-center justify-center rounded-full border',
            active ? 'border-violet-400' : 'border-coffee-300',
          )}
        >
          {active && <span className="h-2 w-2 rounded-full bg-violet-400" />}
        </span>
        {editing ? (
          <TextField value={name} onChange={setName} />
        ) : (
          <span className="font-medium text-coffee-900">{menu.name}</span>
        )}
      </button>
      <div className="flex items-center gap-2">
        {editing ? (
          <Button
            variant="secondary"
            className="px-2 py-1 text-xs"
            onClick={() => {
              void upsertMenu({ ...menu, name: name.trim() || menu.name });
              setEditing(false);
            }}
          >
            {t('common.save')}
          </Button>
        ) : (
          <button type="button" className="text-xs text-coffee-500 hover:text-coffee-800" onClick={() => setEditing(true)}>
            {t('menu.rename')}
          </button>
        )}
        {canDelete && (
          <button type="button" aria-label={t('common.delete')} className="text-coffee-300 hover:text-rose-600" onClick={onDelete}>
            ✕
          </button>
        )}
      </div>
    </Card>
  );
}
