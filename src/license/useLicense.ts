import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { validateLicense } from './lemonsqueezy';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Re-validate an activated license at most once per day. Offline failures keep
 * the cached tier so paid features survive flaky networks.
 */
export function useLicenseValidation(): void {
  const license = useAppStore((s) => s.license);
  const setLicense = useAppStore((s) => s.setLicense);

  useEffect(() => {
    const { key, instanceId, lastValidated, status } = license;
    if (!key || !instanceId) return;
    const fresh = lastValidated && Date.now() - lastValidated < ONE_DAY_MS && status === 'active';
    if (fresh) return;

    let cancelled = false;
    void validateLicense(key, instanceId).then((r) => {
      if (cancelled) return;
      if (r.offline) return; // keep cached state
      if (r.ok) {
        setLicense({
          ...license,
          tier: r.tier,
          status: 'active',
          lastValidated: Date.now(),
          ...(r.productName ? { productName: r.productName } : {}),
        });
      } else {
        setLicense({ ...license, tier: 'free', status: r.status, lastValidated: Date.now() });
      }
    });
    return () => {
      cancelled = true;
    };
    // run once on app load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
