/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Deep Cosmic Void
        void: {
          DEFAULT: '#0B0813',
          deep: '#070510',
        },
        // Surfaces
        surface: {
          DEFAULT: '#161124',
          raised: '#211A35',
          border: '#372B56',
        },
        // Neon Doom Green
        doom: {
          DEFAULT: '#10B981',
          deep: '#059669',
          dim: '#065F46',
        },
        // Infinity Gold
        infinity: {
          DEFAULT: '#F59E0B',
          deep: '#B45309',
        },
        // Incursion Crimson
        incursion: {
          DEFAULT: '#EF4444',
          deep: '#B91C1C',
        },
        muted: {
          DEFAULT: '#8B80A8',
          deep: '#5C5378',
        },
      },
      fontSize: {
        '2xs': '10px',
      },
    },
  },
  plugins: [],
};
