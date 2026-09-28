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
        background: '#f8faf9',
        foreground: '#0c1212',
        card: {
          DEFAULT: '#ffffff',
          foreground: '#0c1212',
        },
        popover: {
          DEFAULT: '#ffffff',
          foreground: '#0c1212',
        },
        primary: {
          DEFAULT: '#0b3b2a',
          hover: '#14573f',
          foreground: '#ffffff',
        },
        secondary: {
          DEFAULT: '#f0fdf4',
          foreground: '#0b3b2a',
        },
        muted: {
          DEFAULT: '#f1f6f3',
          foreground: '#4a5b52',
        },
        accent: {
          DEFAULT: '#e6f4ea',
          foreground: '#0b3b2a',
        },
        border: '#dbe7e1',
        ring: '#0b3b2a',
        surface: '#ffffff',
        'surface-elevated': '#fbfdfc',
        emerald: {
          deep: '#0b3b2a',
          pine: '#14573f',
          moss: '#082d22',
          light: '#f0fdf4',
          mint: '#86efac',
        },
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
        vaayu: ['"Danfo"', 'serif', 'system-ui'],
        danfo: ['"Danfo"', 'serif', 'system-ui'],
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
