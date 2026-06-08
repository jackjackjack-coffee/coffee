import type { ReactNode } from 'react';
import { useT } from '../../i18n';
import { useTier } from '../../lib/hooks';
import { hasFeature, type Feature } from '../../license/gate';
import { LS_CHECKOUT_CAFE, LS_CHECKOUT_PERSONAL } from '../../license/lemonsqueezy';
import { useAppStore } from '../../store/useAppStore';

export function ProBadge() {
  return (
    <span className="chip bg-gold/15 text-gold">PRO</span>
  );
}

function BuyButtons({ which }: { which: 'personal' | 'cafe' | 'both' }) {
  const t = useT();
  return (
    <div className="flex flex-wrap gap-2">
      {(which === 'personal' || which === 'both') && (
        <a className="btn-primary" href={LS_CHECKOUT_PERSONAL} target="_blank" rel="noreferrer">
          {t('pro.unlockPersonal')}
        </a>
      )}
      {(which === 'cafe' || which === 'both') && (
        <a className="btn-primary" href={LS_CHECKOUT_CAFE} target="_blank" rel="noreferrer">
          {t('pro.unlockCafe')}
        </a>
      )}
    </div>
  );
}

/** Full-section paywall with a blurred value-preview behind it. */
export function LockedFeature({
  feature,
  children,
  title,
  blurb,
}: {
  feature: Feature;
  children?: ReactNode;
  title?: string;
  blurb?: string;
}) {
  const tier = useTier();
  const t = useT();
  const setSection = useAppStore((s) => (s.mode === 'home' ? s.setHomeSection : s.setCafeSection));

  if (hasFeature(tier, feature)) return <>{children}</>;

  const isHome = feature.startsWith('home.');
  const which = isHome ? 'personal' : 'cafe';
  const defaultBlurb = isHome ? t('pro.homeBlurb') : t('pro.cafeBlurb');

  return (
    <div className="relative overflow-hidden rounded-2xl border border-coffee-100">
      {children && (
        <div aria-hidden className="pointer-events-none select-none opacity-40 blur-[3px]">
          {children}
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-glassbg/80 p-6 backdrop-blur-md">
        <div className="max-w-sm text-center">
          <div className="mb-2 inline-block">
            <ProBadge />
          </div>
          <h3 className="text-base font-semibold text-coffee-900">{title ?? t('pro.locked')}</h3>
          <p className="mt-1 text-sm text-coffee-600">{blurb ?? defaultBlurb}</p>
          <div className="mt-4 flex justify-center">
            <BuyButtons which={which} />
          </div>
          <button
            type="button"
            className="mt-3 text-xs text-coffee-500 underline"
            onClick={() => setSection('settings' as never)}
          >
            {t('set.license')}
          </button>
        </div>
      </div>
    </div>
  );
}

/** Compact inline paywall used inside modals (e.g. when a save limit is hit). */
export function PaywallNote({ mode }: { mode: 'home' | 'cafe' }) {
  const t = useT();
  return (
    <div className="rounded-xl bg-gold/10 p-3 text-sm text-gold">
      <p>{mode === 'home' ? t('pro.homeBlurb') : t('pro.cafeBlurb')}</p>
      <div className="mt-3">
        <BuyButtons which={mode === 'home' ? 'personal' : 'cafe'} />
      </div>
    </div>
  );
}
