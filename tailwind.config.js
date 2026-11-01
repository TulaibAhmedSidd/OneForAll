/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Pakistan-green "prize bond" palette with a gold ticket accent.
        forest: { DEFAULT: '#0E3B2E', deep: '#0A2B22', soft: '#145140' },
        jade: { DEFAULT: '#1F7A5C', light: '#D5EBE1' },
        gold: { DEFAULT: '#E8B64C', deep: '#C9952B', pale: '#FBF0D4' },
        paper: { DEFAULT: '#F2F6F3', card: '#FFFFFF' },
        ink: { DEFAULT: '#10201B', soft: '#4B5E57', mute: '#7E8F88' },
        line: '#DCE5DF',
        coral: { DEFAULT: '#E5604D', pale: '#FCE6E2' },
      },
      fontFamily: {
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      borderRadius: { ticket: '18px' },
      boxShadow: {
        ticket: '0 1px 0 rgba(16,32,27,.04), 0 10px 30px -12px rgba(14,59,46,.28)',
        lift: '0 18px 40px -16px rgba(14,59,46,.45)',
      },
      keyframes: {
        stamp: { '0%': { transform: 'scale(1.6) rotate(-14deg)', opacity: 0 }, '60%': { transform: 'scale(.92) rotate(-8deg)', opacity: 1 }, '100%': { transform: 'scale(1) rotate(-8deg)' } },
        rise: { from: { transform: 'translateY(12px)', opacity: 0 }, to: { transform: 'none', opacity: 1 } },
      },
      animation: {
        stamp: 'stamp .5s cubic-bezier(.2,.8,.2,1) both',
        rise: 'rise .45s ease-out both',
      },
    },
  },
  plugins: [],
};
