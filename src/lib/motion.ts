import type { Transition, Variants } from 'framer-motion';

/** Soft, expensive-feeling ease used across the app. */
export const EASE_OUT: Transition['ease'] = [0.22, 1, 0.36, 1];

/** Fade + rise, used for individual cards/items. */
export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } },
};

/** Container that staggers its children's `fadeUp` reveals. */
export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Scale + fade, used for hero / focal elements. */
export const popIn: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

/** Section-to-section page transition (used with AnimatePresence mode="wait"). */
export const sectionTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.28, ease: EASE_OUT },
} as const;

/** Springy layout transition for sliding active-indicators (layoutId). */
export const indicatorSpring: Transition = {
  type: 'spring',
  stiffness: 420,
  damping: 34,
  mass: 0.7,
};
