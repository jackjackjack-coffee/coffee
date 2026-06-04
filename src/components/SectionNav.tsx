import { useId } from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { useT } from '../i18n';
import { cn } from '../lib/cn';
import { useTier } from '../lib/hooks';
import { indicatorSpring } from '../lib/motion';
import { hasFeature } from '../license/gate';
import { useAppStore } from '../store/useAppStore';
import { CAFE_SECTIONS, HOME_SECTIONS } from './sections';
import { SECTION_ICON } from './icons';

export function SectionNav() {
  const t = useT();
  const tier = useTier();
  const mode = useAppStore((s) => s.mode);
  const homeSection = useAppStore((s) => s.homeSection);
  const cafeSection = useAppStore((s) => s.cafeSection);
  const setHomeSection = useAppStore((s) => s.setHomeSection);
  const setCafeSection = useAppStore((s) => s.setCafeSection);
  const pill = `tabpill-${useId()}`;

  const sections = mode === 'home' ? HOME_SECTIONS : CAFE_SECTIONS;
  const active = mode === 'home' ? homeSection : cafeSection;
  const setActive = mode === 'home' ? setHomeSection : setCafeSection;

  return (
    <nav className="border-b border-coffee-100 bg-white/80 backdrop-blur">
      <div className="mx-auto w-full">
        <div className="flex gap-1 overflow-x-auto px-3 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sections.map((s) => {
            const locked = s.feature ? !hasFeature(tier, s.feature) : false;
            const isActive = active === s.id;
            const Icon = SECTION_ICON[s.id];
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setActive(s.id as never)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive ? 'text-white' : 'text-coffee-600 hover:bg-coffee-100',
                )}
              >
                {isActive && (
                  <motion.span
                    layoutId={pill}
                    transition={indicatorSpring}
                    className="absolute inset-0 rounded-full bg-coffee-700"
                  />
                )}
                <span className="relative z-10 flex items-center gap-1.5">
                  {Icon && <Icon className="h-4 w-4" strokeWidth={2.2} />}
                  {t(s.tKey)}
                  {locked && <Lock className="h-3 w-3 opacity-80" />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
