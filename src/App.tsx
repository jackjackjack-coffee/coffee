import { useEffect, useState } from 'react';
import { ensureSeeded } from './data/db';
import { useAppStore } from './store/useAppStore';
import { useLicenseValidation } from './license/useLicense';
import { AppShell } from './components/AppShell';
import { BrandMark } from './components/BrandMark';
import { useT } from './i18n';

export default function App() {
  const language = useAppStore((s) => s.language);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    ensureSeeded(language)
      .catch((e) => console.error('seed failed', e))
      .finally(() => alive && setReady(true));
    return () => {
      alive = false;
    };
    // seed once on first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useLicenseValidation();

  if (!ready) return <Loader />;

  return <AppShell />;
}

function Loader() {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream bg-grain">
      <span className="animate-bob text-coffee-700">
        <BrandMark size={56} />
      </span>
      <span className="font-display text-lg font-semibold text-coffee-800">{t('app.name')}</span>
      <span className="h-1 w-28 overflow-hidden rounded-full bg-coffee-100">
        <span className="block h-full w-1/2 animate-loadbar rounded-full bg-caramel" />
      </span>
    </div>
  );
}
