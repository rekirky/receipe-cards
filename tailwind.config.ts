import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        charcoal: {
          50: '#f5f5f4',
          100: '#e7e5e4',
          200: '#d6d3d1',
          300: '#a8a29e',
          400: '#78716c',
          500: '#57534e',
          600: '#44403c',
          700: '#292524',
          800: '#1c1917',
          900: '#0c0a09',
        },
        ember: {
          50:  'rgb(var(--ember-50)  / <alpha-value>)',
          100: 'rgb(var(--ember-100) / <alpha-value>)',
          200: 'rgb(var(--ember-200) / <alpha-value>)',
          300: 'rgb(var(--ember-300) / <alpha-value>)',
          400: 'rgb(var(--ember-400) / <alpha-value>)',
          500: 'rgb(var(--ember-500) / <alpha-value>)',
          600: 'rgb(var(--ember-600) / <alpha-value>)',
          700: 'rgb(var(--ember-700) / <alpha-value>)',
          800: 'rgb(var(--ember-800) / <alpha-value>)',
          900: 'rgb(var(--ember-900) / <alpha-value>)',
        },
        smoke: {
          light: '#b5b0ab',
          DEFAULT: '#6b6560',
          dark: '#3d3733',
        },
      },
      fontFamily: {
        display: ['Bebas Neue', 'Impact', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
