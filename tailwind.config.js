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
        background: {
          DEFAULT: '#09090B',
          light: '#F8FAFC',
        },
        surface: {
          DEFAULT: '#111113',
          elevated: '#18181B',
          subtle: '#141416',
          light: '#FFFFFF',
          'light-elevated': '#F1F5F9',
        },
        border: {
          DEFAULT: '#27272A',
          subtle: '#1E1E22',
          light: '#E2E8F0',
        },
        text: {
          primary: '#FAFAFA',
          secondary: '#A1A1AA',
          muted: '#71717A',
          'light-primary': '#0F172A',
          'light-secondary': '#475569',
          'light-muted': '#94A3B8',
        },
        accent: {
          blue: {
            DEFAULT: '#3B82F6',
            hover: '#2563EB',
            subtle: 'rgba(59, 130, 246, 0.1)',
          },
          cyan: {
            DEFAULT: '#06B6D4',
            hover: '#0891B2',
            subtle: 'rgba(6, 182, 212, 0.1)',
          },
          green: {
            DEFAULT: '#10B981',
            hover: '#059669',
            subtle: 'rgba(16, 185, 129, 0.1)',
          },
          amber: {
            DEFAULT: '#F59E0B',
            hover: '#D97706',
            subtle: 'rgba(245, 158, 11, 0.1)',
          },
          red: {
            DEFAULT: '#EF4444',
            hover: '#DC2626',
            subtle: 'rgba(239, 68, 68, 0.1)',
          },
          purple: {
            DEFAULT: '#8B5CF6',
            hover: '#7C3AED',
            subtle: 'rgba(139, 92, 246, 0.1)',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow-blue': '0 0 20px -5px rgba(59, 130, 246, 0.25)',
        'glow-cyan': '0 0 20px -5px rgba(6, 182, 212, 0.25)',
        'glow-green': '0 0 20px -5px rgba(16, 185, 129, 0.25)',
      },
      backgroundImage: {
        'grid-pattern': "radial-gradient(circle, rgba(255, 255, 255, 0.05) 1px, transparent 1px)",
      },
      backgroundSize: {
        'grid-sm': '16px 16px',
        'grid-md': '24px 24px',
      }
    },
  },
  plugins: [],
}
