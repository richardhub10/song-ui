/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        ink: {
          950: '#0b0b0f',
          900: '#111115',
          800: '#1b1b22',
          700: '#2a2a34',
        },
      },
      boxShadow: {
        neon: '0 0 0 1px rgba(255,255,255,0.08), 0 24px 80px rgba(0,0,0,0.5)',
      },
      backgroundImage: {
        'aurora-radial': 'radial-gradient(circle at top, rgba(255, 65, 65, 0.18), transparent 35%), radial-gradient(circle at right, rgba(59, 130, 246, 0.12), transparent 30%), linear-gradient(180deg, rgba(255,255,255,0.04), transparent 35%)',
      },
    },
  },
  plugins: [],
};
