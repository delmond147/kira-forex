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
        admin: {
          bg: '#F8FAF9',
          sidebar: '#072B19',
          active: '#0E4D2E',
          card: '#FFFFFF',
          text: '#111814',
          muted: '#62756A',
        },
        forest: {
          800: '#0E3E26',
          900: '#072B19',
        },
        emerald: {
          500: '#008751',
          600: '#006E42',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
