import { useState } from 'react';
import { resetToSeed } from '../../data/db';
import type { Currency, Language, LicenseTier } from '../../data/types';
import { useAppStore } from '../../store/useAppStore';
import { useT } from '../../i18n';
import { useFormat } from '../../lib/hooks';
import { getOrCreateInstanceId } from '../../lib/id';
import { CURRENCY_SYMBOL } from '../../lib/format';
import {
  activateLicense,
  ALLOW_DEMO_KEYS,
  LS_CHECKOUT_CAFE,
  LS_CHECKOUT_PERSONAL,
} from '../../license/lemonsqueezy';
import { Button } from '../../components/ui/Button';
import { Card, SectionTitle } from '../../components/ui/Card';
import { SelectField, TextField } from '../../components/ui/fields';

const TIER_KEY: Record<LicenseTier, 'set.tier.free' | 'set.tier.personal' | 'set.tier.cafe'> = {
  free: 'set.tier.free',
  personal: 'set.tier.personal',
  cafe: 'set.tier.cafe',
};

export function SettingsPanel() {
  const t = useT();
  const fmt = useFormat();
  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const currency = useAppStore((s) => s.currency);
  const setCurrency = useAppStore((s) => s.setCurrency);

  return (
    <div className="space-y-4">
      <SectionTitle title={t('set.title')} />

      <Card className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label={t('set.language')}
            value={language}
            onChange={(v) => setLanguage(v as Language)}
            options={[
              { value: 'ko', label: '한국어' },
              { value: 'en', label: 'English' },
            ]}
          />
          <SelectField
            label={t('set.currency')}
            value={currency}
            onChange={(v) => setCurrency(v as Currency)}
            options={(['KRW', 'USD', 'EUR'] as Currency[]).map((c) => ({
              value: c,
              label: `${CURRENCY_SYMBOL[c]} ${c}`,
            }))}
          />
        </div>
        <p className="text-xs text-coffee-500 tnum">
          {fmt.money(4500)} · {fmt.unit(2.5)}
        </p>
      </Card>

      <LicenseCard />

      <DataCard />

      <Card>
        <div className="mb-1 text-sm font-semibold text-coffee-800">{t('set.about')}</div>
        <p className="text-sm text-coffee-600">{t('set.aboutBlurb')}</p>
        <p className="mt-2 text-xs text-coffee-400">
          <a className="underline" href={LS_CHECKOUT_PERSONAL} target="_blank" rel="noreferrer">
            {t('set.buyPersonal')}
          </a>
          {' · '}
          <a className="underline" href={LS_CHECKOUT_CAFE} target="_blank" rel="noreferrer">
            {t('set.buyCafe')}
          </a>
        </p>
      </Card>
    </div>
  );
}

function LicenseCard() {
  const t = useT();
  const license = useAppStore((s) => s.license);
  const setLicense = useAppStore((s) => s.setLicense);
  const clearLicense = useAppStore((s) => s.clearLicense);

  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activate = async () => {
    setBusy(true);
    setError(null);
    const instanceId = getOrCreateInstanceId();
    const r = await activateLicense(key, instanceId);
    setBusy(false);
    if (r.ok) {
      setLicense({
        tier: r.tier,
        key: key.trim(),
        instanceId: r.instanceId ?? instanceId,
        status: 'active',
        lastValidated: Date.now(),
        ...(r.productName ? { productName: r.productName } : {}),
      });
      setKey('');
    } else {
      setError(r.status === 'mismatch' ? t('set.licenseMismatch') : t('set.licenseInvalid'));
    }
  };

  const isActive = license.tier !== 'free' && license.status === 'active';

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-coffee-800">{t('set.license')}</span>
        <span className={`chip ${isActive ? 'bg-mint/15 text-mint' : 'bg-white/5 text-coffee-600'}`}>
          {t(TIER_KEY[license.tier])}
        </span>
      </div>

      {isActive ? (
        <div className="space-y-2">
          <p className="text-sm text-mint">✓ {t('set.licenseActive')}</p>
          {license.productName && <p className="text-xs text-coffee-500">{license.productName}</p>}
          {license.lastValidated && (
            <p className="text-xs text-coffee-400">
              {t('set.validated', { when: new Date(license.lastValidated).toLocaleDateString() })}
            </p>
          )}
          <Button variant="secondary" onClick={clearLicense}>
            {t('set.deactivate')}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <TextField label={t('set.enterKey')} value={key} onChange={setKey} placeholder="XXXXXXXX-XXXX-XXXX" />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          {ALLOW_DEMO_KEYS && (
            <p className="text-[11px] text-coffee-400">demo: DEMO-PERSONAL · DEMO-CAFE</p>
          )}
          <Button onClick={activate} disabled={busy || key.trim() === ''}>
            {busy ? t('set.activating') : t('set.activate')}
          </Button>
        </div>
      )}
    </Card>
  );
}

function DataCard() {
  const t = useT();
  const language = useAppStore((s) => s.language);
  return (
    <Card>
      <div className="mb-2 text-sm font-semibold text-coffee-800">{t('set.data')}</div>
      <Button
        variant="secondary"
        onClick={() => {
          if (confirm(t('set.resetConfirm'))) void resetToSeed(language);
        }}
      >
        {t('set.resetSample')}
      </Button>
    </Card>
  );
}
