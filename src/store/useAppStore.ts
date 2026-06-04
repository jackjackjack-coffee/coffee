/** App-level UI + license state (persisted to localStorage). Domain data lives in IndexedDB. */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Currency, Language, LicenseTier, Mode } from '../data/types';

export type HomeSection =
  | 'dashboard'
  | 'supplies'
  | 'recipes'
  | 'equipment'
  | 'roi'
  | 'spending'
  | 'settings';

export type CafeSection =
  | 'dashboard'
  | 'ingredients'
  | 'drinks'
  | 'pricing'
  | 'menus'
  | 'whatif'
  | 'books'
  | 'settings';

export type LicenseStatus = 'active' | 'inactive' | 'expired' | 'invalid' | 'mismatch';

export interface LicenseState {
  tier: LicenseTier;
  key?: string;
  instanceId?: string;
  instanceToken?: string;
  lastValidated?: number;
  status?: LicenseStatus;
  productName?: string;
}

interface AppState {
  mode: Mode;
  language: Language;
  currency: Currency;
  homeSection: HomeSection;
  cafeSection: CafeSection;
  activeMenuId: string | null;
  license: LicenseState;

  setMode: (mode: Mode) => void;
  setLanguage: (language: Language) => void;
  setCurrency: (currency: Currency) => void;
  setHomeSection: (s: HomeSection) => void;
  setCafeSection: (s: CafeSection) => void;
  setActiveMenuId: (id: string | null) => void;
  setLicense: (license: LicenseState) => void;
  clearLicense: () => void;
}

const FREE_LICENSE: LicenseState = { tier: 'free' };

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      mode: 'home',
      language: 'ko',
      currency: 'KRW',
      homeSection: 'dashboard',
      cafeSection: 'dashboard',
      activeMenuId: null,
      license: FREE_LICENSE,

      setMode: (mode) => set({ mode }),
      setLanguage: (language) => set({ language }),
      setCurrency: (currency) => set({ currency }),
      setHomeSection: (homeSection) => set({ homeSection }),
      setCafeSection: (cafeSection) => set({ cafeSection }),
      setActiveMenuId: (activeMenuId) => set({ activeMenuId }),
      setLicense: (license) => set({ license }),
      clearLicense: () => set({ license: FREE_LICENSE }),
    }),
    {
      name: 'ca.app',
      version: 1,
    },
  ),
);
