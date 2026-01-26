/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {},
  },
  plugins: [],
  safelist: [
    // Permitir utilidades arbitrarias usadas en el proyecto
    {
      pattern: /shadow-\[.*\]/,
      variants: ['hover', 'focus'],
    },
    {
      pattern: /rounded-\[.*\]/,
    },
    {
      pattern: /border-\[.*\]/,
    },
    {
      pattern: /scale-\[.*\]/,
      variants: ['hover'],
    },
  ],
  // Activar JIT si es necesario (Tailwind 3+ lo usa por defecto)
};
