/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        monarch: {
          bg: '#1a102c',
          'bg-light': '#211339',
          main: '#2e1a52',
          light: '#4d2da3',
          accent: '#9d5bff',
          'accent-hover': '#b88cff',
          text: '#e6ddeb',
          'text-dark': '#bca9d4',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 8px 0px rgba(157, 91, 255, 0.4)', color: '#e6ddeb' },
          '50%': { boxShadow: '0 0 20px 4px rgba(157, 91, 255, 0.8)', color: '#ffffff' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-1rem)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-100%)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.95)' },
          to: { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        pulseGlow: 'pulseGlow 3s ease-in-out infinite',
        fadeInDown: 'fadeInDown 0.3s ease-out forwards',
        slideInRight: 'slideInRight 0.3s ease-out forwards',
        slideInLeft: 'slideInLeft 0.3s ease-out forwards',
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scaleIn: 'scaleIn 0.2s ease-out forwards',
        shimmer: 'shimmer 2s infinite linear',
      },
      boxShadow: {
        'glow-sm': '0 0 4px rgba(157, 91, 255, 0.3)',
        'glow-md': '0 0 8px rgba(157, 91, 255, 0.4)',
        'glow-lg': '0 0 16px rgba(157, 91, 255, 0.5)',
        'inner-glow': 'inset 0 0 8px rgba(157, 91, 255, 0.2)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

