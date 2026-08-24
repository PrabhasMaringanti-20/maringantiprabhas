/** @type {import('tailwindcss').Config} */

// Every colour resolves through a CSS variable declared in global.css, so the
// light and dark palettes swap without a single `dark:` class in a component.
const token = (name) => `rgb(var(--color-${name}) / <alpha-value>)`;

module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: token('canvas'),
        surface: {
          DEFAULT: token('surface'),
          raised: token('raised'),
        },
        line: token('line'),
        ink: {
          DEFAULT: token('ink'),
          soft: token('ink-soft'),
          faint: token('ink-faint'),
        },
        accent: {
          DEFAULT: token('accent'),
          soft: token('accent-soft'),
        },
        marvel: {
          DEFAULT: token('marvel'),
          soft: token('marvel-soft'),
        },
        crimson: {
          DEFAULT: token('crimson'),
          soft: token('crimson-soft'),
        },
        violet: {
          DEFAULT: token('violet'),
          soft: token('violet-soft'),
        },
        scrim: token('scrim'),
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
  plugins: [],
};
