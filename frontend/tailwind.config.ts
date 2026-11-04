import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#F0F7F2',
          100: '#E0EFE5',
          200: '#BFDFCB',
          300: '#94C7AA',
          400: '#62A982',
          500: '#3D8C61',
          600: '#2D714C',
          700: '#235A3D',
          800: '#0E3E26',
          900: '#072B19',
          950: '#04170D',
        },
        academy: {
          green: '#008751',
          dark: '#005734',
          light: '#E6F4ED',
          border: '#D0E6DB',
        },
        sage: {
          50: '#FAFBF9',
          100: '#F3F6F4',
          200: '#E4EAE6',
          300: '#C7D4CD',
        },
        gold: {
          accent: '#C5A059',
          light: '#F5EEDC',
        },
        charcoal: {
          DEFAULT: '#111814',
          muted: '#586A60',
          light: '#8E9E96',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(7, 43, 25, 0.05), 0 20px 25px -5px rgba(7, 43, 25, 0.02)',
        card: '0 4px 20px -2px rgba(7, 43, 25, 0.06)',
        elevated: '0 20px 40px -15px rgba(7, 43, 25, 0.12)',
      },
    },
  },
  plugins: [],
};

export default config;
