/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50: '#FDFBF6',
          100: '#F9F4EA',
          200: '#F1E8D8',
          300: '#E5D6BF',
        },
        coffee: {
          50: '#F5EFE8',
          100: '#E8DACB',
          200: '#D3BCA5',
          300: '#B99B7E',
          400: '#9C7A5A',
          500: '#7E5D42',
          600: '#644A35',
          700: '#4C3728',
          800: '#36271D',
          900: '#241A13',
        },
        caramel: '#B07D56',
        espresso: '#2B1D15',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 24px 60px -30px rgba(43, 29, 21, 0.35)',
        card: '0 12px 32px -20px rgba(43, 29, 21, 0.28)',
      },
      borderRadius: {
        '4xl': '2rem',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.4s ease-out both',
      },
    },
  },
  plugins: [],
}
