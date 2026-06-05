/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Celestial dark theme: the `coffee` ramp is INVERTED — a high number is LIGHT.
        // This lets the existing `text-coffee-900/800/700/...` classes (headings → faint
        // labels) re-skin to light-on-dark with no per-file edits.
        //   text-coffee-900 → near-white heading
        //   text-coffee-500 → muted lavender label
        //   text-coffee-300 → dim icon/affordance
        // Low-shade *surfaces* (bg/border-coffee-50/100/200) are swept to white/opacity
        // utilities separately, since an inverted-dark fill would be invisible.
        coffee: {
          50: '#181230',
          100: '#241d44',
          200: '#352c60',
          300: '#564a86',
          400: '#7d6eb4',
          500: '#9a8bcb',
          600: '#b8a9e4',
          700: '#cdbff2',
          800: '#e3d9fa',
          900: '#f4eefe',
          950: '#ffffff',
        },
        cream: '#0e0b1a', // repurposed: any stray `bg-cream` now reads dark (safety net)
        night: '#0a0717', // deepest backdrop / scrims
        plum: '#1b1233', // mid gradient stop / popover & modal surface
        glassbg: '#1a1530',
        mint: '#34d399', // green margin accent (replaces emerald)
        gold: '#fbbf24', // peach/gold highlight (replaces amber)
        starlit: '#c4b5fd', // active-nav glow / chart line
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
