import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../data/db';
import type { Menu } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';

export function useMenus(): Menu[] {
  return useLiveQuery(() => db.menus.toArray(), [], [] as Menu[]);
}

export function useActiveMenu(): Menu | undefined {
  const menus = useMenus();
  const activeId = useAppStore((s) => s.activeMenuId);
  return menus.find((m) => m.id === activeId) ?? menus.find((m) => m.isDefault) ?? menus[0];
}
