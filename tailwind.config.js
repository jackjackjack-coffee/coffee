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
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
