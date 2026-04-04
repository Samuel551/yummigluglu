/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primarios
        verde: '#2D9B5A',
        'verde-claro': '#E8F7EE',
        naranja: '#F28B3B',

        // Neutros
        'fondo-app': '#F7F5F0',
        'gris-claro': '#EEEBE6',
        'gris-texto': '#6B6560',
        negro: '#1A1714',

        // Semánticos
        error: '#E53935',
        exito: '#2D9B5A',
        advertencia: '#F9A825',
        info: '#1976D2',

        // Etapas
        inicio: '#A8D8A8',
        transicion: '#FFD08A',
        preescolar: '#A8C8FF',

        // Premium
        premium: '#F28B3B',
        'premium-fondo': '#FFF4EC',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
};
