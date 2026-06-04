import { cn } from '../lib/cn';

/**
 * Animated espresso cup with three rising steam wisps. Pure SVG + CSS so it
 * works everywhere and degrades to a static cup under prefers-reduced-motion.
 */
export function BrandMark({ size = 30, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={cn('shrink-0', className)}
      aria-hidden="true"
    >
      {/* steam */}
      <g className="steam" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" opacity="0.9">
        <path d="M12 9c-1.2-1.2-1.2-2.4 0-3.6" />
        <path d="M16 8.4c-1.2-1.2-1.2-2.4 0-3.6" />
        <path d="M20 9c-1.2-1.2-1.2-2.4 0-3.6" />
      </g>
      {/* saucer */}
      <ellipse cx="16" cy="27" rx="11" ry="2.2" fill="currentColor" opacity="0.25" />
      {/* cup body */}
      <path
        d="M7 13h15v5a7 7 0 0 1-7 7h-1a7 7 0 0 1-7-7v-5Z"
        fill="currentColor"
      />
      {/* coffee surface highlight */}
      <ellipse cx="14.5" cy="13.2" rx="7.5" ry="1.5" fill="currentColor" opacity="0.45" />
      {/* handle */}
      <path
        d="M22 14.5h2.5a3.5 3.5 0 0 1 0 7H22"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
      />
    </svg>
  );
}
