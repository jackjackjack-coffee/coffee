import { useState } from 'react';

/** Tiny info affordance: native tooltip + tap-to-toggle popover for mobile. */
export function Info({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label="info"
        title={text}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-coffee-300 text-[10px] font-bold leading-none text-coffee-500 hover:bg-coffee-100"
      >
        i
      </button>
      {open && (
        <span className="absolute left-1/2 top-6 z-20 w-52 -translate-x-1/2 rounded-lg border border-coffee-200 bg-white px-3 py-2 text-xs font-normal leading-relaxed text-coffee-800 shadow-lg">
          {text}
        </span>
      )}
    </span>
  );
}
