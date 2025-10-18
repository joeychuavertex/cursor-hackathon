/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        shark: {
          blue: '#1e40af',
          dark: '#1e3a8a',
          light: '#3b82f6',
        },
        judge: {
          gold: '#fbbf24',
          silver: '#9ca3af',
        }
      },
      animation: {
        'micro-expression': 'microExpression 0.3s ease-in-out',
        'judge-reaction': 'judgeReaction 0.5s ease-in-out',
      },
      keyframes: {
        microExpression: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        judgeReaction: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
          '100%': { transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
