import {
  BookOpen,
  BookText,
  CupSoda,
  LayoutDashboard,
  Leaf,
  Receipt,
  ScrollText,
  Settings,
  ShoppingBasket,
  Sparkles,
  Tag,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

/** Section id → professional line icon, shared by the sidebar and mobile tab bar. */
export const SECTION_ICON: Record<string, LucideIcon> = {
  // home
  dashboard: LayoutDashboard,
  supplies: ShoppingBasket,
  recipes: ScrollText,
  equipment: Wrench,
  roi: TrendingUp,
  spending: Receipt,
  settings: Settings,
  // cafe
  ingredients: Leaf,
  drinks: CupSoda,
  pricing: Tag,
  menus: BookOpen,
  whatif: Sparkles,
  books: BookText,
};
