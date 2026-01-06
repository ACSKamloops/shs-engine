/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // SHS Brand Colors - Forest & Earth Tones
        'shs-forest': {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        'shs-amber': {
          50: '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        'shs-sky': {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        'shs-violet': {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
        },
        // Page backgrounds
        'shs-cream': '#fefdf8',
        'shs-sand': '#f5f1e8',
        'shs-stone': '#e5e0d5',
        // Text colors
        'shs-text': {
          body: '#374151',
          muted: '#6b7280',
          light: '#9ca3af',
        },
        // Legacy support for existing code
        bg: {
          base: "var(--bg-base)",
          primary: "var(--bg-primary)",
          secondary: "var(--bg-secondary)",
          elevated: "var(--bg-elevated)",
          hover: "var(--bg-hover)",
        },
        accent: {
          primary: "var(--accent-primary)",
          secondary: "var(--accent-secondary)",
        },
        text: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
          muted: "var(--text-muted)",
        },
        glass: {
          border: "var(--glass-border)",
        },
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'SF Mono', 'monospace'],
      },
      backgroundImage: {
        'text-gradient-shs': 'linear-gradient(135deg, #166534 0%, #15803d 50%, #22c55e 100%)',
      },
    },
  },
  plugins: [],
}
