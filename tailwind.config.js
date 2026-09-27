/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b',
        foreground: '#fafafa',
        card: {
          DEFAULT: '#121316',
          foreground: '#fafafa',
        },
        popover: {
          DEFAULT: '#121316',
          foreground: '#fafafa',
        },
        primary: {
          DEFAULT: '#2563eb',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#27272a',
          foreground: '#f4f4f5',
        },
        muted: {
          DEFAULT: '#1c1d22',
          foreground: '#a1a1aa',
        },
        accent: {
          DEFAULT: '#27272a',
          foreground: '#fafafa',
        },
        border: '#27272a',
        ring: '#3f3f46',
        surface: '#121316',
        'surface-elevated': '#18191e',
        aqi: {
          good: '#16a34a',
          satisfactory: '#65a30d',
          moderate: '#ca8a04',
          poor: '#ea580c',
          verypoor: '#dc2626',
          severe: '#881337',
        }
      },
      fontFamily: {
        heading: ['"Righteous"', 'system-ui', 'sans-serif'],
        title: ['"Righteous"', 'system-ui', 'sans-serif'],
        sans: ['"Lato"', 'system-ui', 'sans-serif'],
        lato: ['"Lato"', 'system-ui', 'sans-serif'],
        numbers: ['"Archivo Black"', 'sans-serif'],
        mono: ['"Archivo Black"', '"JetBrains Mono"', 'monospace'],
      }
    },
  },
  plugins: [],
}
