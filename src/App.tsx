import { useEffect, useState } from 'react';
import { ensureSeeded } from './data/db';
import { useAppStore } from './store/useAppStore';
import { useLicenseValidation } from './license/useLicense';
import { AppShell } from './components/AppShell';

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

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center text-coffee-500">
        <span className="animate-pulse text-2xl">☕</span>
      </div>
    );
  }

  return <AppShell />;
}
