/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coffee: {
          50: '#faf6f2',
          100: '#f1e7dd',
          200: '#e2cdb9',
          300: '#d0ac8c',
          400: '#bd8861',
          500: '#a96d44',
          600: '#965938',
          700: '#7c4730',
          800: '#663b2c',
          900: '#553227',
          950: '#2e1a13',
        },
        cream: '#f8f4ee',
        caramel: '#c98a4b',
        espresso: '#2e1a13',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      boxShadow: {
        warm: '0 6px 20px -8px rgba(85, 50, 39, 0.25)',
      },
      backgroundImage: {
        grain:
          'radial-gradient(1200px 600px at 100% -10%, rgba(201, 138, 75, 0.10), transparent 60%), radial-gradient(900px 500px at -10% 110%, rgba(124, 71, 48, 0.08), transparent 55%)',
      },
    },
  },
  plugins: [],
};
