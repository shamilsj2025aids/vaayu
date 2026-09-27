/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0a0f1d',
        surface: '#111827',
        'surface-elevated': '#1e293b',
        'surface-highlight': '#334155',
        border: '#1f293d',
        aqi: {
          good: '#10b981',
          satisfactory: '#84cc16',
          moderate: '#eab308',
          poor: '#f97316',
          verypoor: '#ef4444',
          severe: '#881337',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'Monaco', 'Courier New', 'monospace'],
      }
    },
  },
  plugins: [],
}
