/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Light theme: warm/cool dawn UI. The `coffee` ramp is a NORMAL dark-on-light
        // neutral (high number = dark text, low number = light surface), a cool
        // plum-grey so dark text reads on the cream frosted panels.
        //   text-coffee-900 → dark heading
        //   text-coffee-500/400 → muted plum label
        //   bg/border-coffee-100/200 → soft light hairlines & fills
        // The dark sidebar/scrims use the `night`/`plum` tokens with explicit light text.
        coffee: {
          50: '#f7f5fb',
          100: '#eee9f6',
          200: '#ddd4ec',
          300: '#c3b7db',
          400: '#9a8cba',
          500: '#736691',
          600: '#574c75',
          700: '#433a5d',
          800: '#312a45',
          900: '#241d33',
          950: '#15111f',
        },
        cream: '#f6f2fb', // soft light fallback surface
        night: '#120c2b', // dark sidebar / scrims
        plum: '#1b1233', // deep accent / dark gradient stop
        glassbg: '#faf7ff',
        mint: '#0f9d63', // green margin accent (readable on light)
        gold: '#d97706', // amber highlight (readable on light)
        starlit: '#c4b5fd', // active-nav glow (on the dark sidebar)
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
