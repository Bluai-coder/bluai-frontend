/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* ShadCN tokens */
        border: 'oklch(var(--border))',
        input: 'oklch(var(--input))',
        ring: 'oklch(var(--ring))',
        background: 'oklch(var(--background))',
        foreground: 'oklch(var(--foreground))',

        primary: {
          DEFAULT: 'oklch(var(--primary))',
          foreground: 'oklch(var(--primary-foreground))',
        },

        secondary: {
          DEFAULT: 'oklch(var(--secondary))',
          foreground: 'oklch(var(--secondary-foreground))',
        },

        muted: {
          DEFAULT: 'oklch(var(--muted))',
          foreground: 'oklch(var(--muted-foreground))',
        },

        accent: {
          DEFAULT: 'oklch(var(--accent))',
          foreground: 'oklch(var(--accent-foreground))',
        },

        destructive: {
          DEFAULT: 'oklch(var(--destructive))',
        },

        card: {
          DEFAULT: 'oklch(var(--card))',
          foreground: 'oklch(var(--card-foreground))',
        },

        popover: {
          DEFAULT: 'oklch(var(--popover))',
          foreground: 'oklch(var(--popover-foreground))',
        },

        /* Your existing system colors */
        brand: {
          50: '#eef6fb',
          100: '#d4e9f5',
          200: '#a9d3eb',
          300: '#195ec5',
          400: '#195ec5',
          500: '#195ec5',
          600: '#155a8a',
          700: '#195ec5',
          800: '#195ec5',
          900: '#195ec5',
          950: '#195ec5',
        },

        lab: {
          hematology: '#E74C3C',
          biochemistry: '#F39C12',
          immunology: '#195ec5',
          microbiology: '#27AE60',
          pathology: '#8E44AD',
          clinical: '#1ABC9C',
        },

        status: {
          registered: '#6B7280',
          collected: '#3B82F6',
          received: '#8B5CF6',
          'in-progress': '#F59E0B',
          completed: '#10B981',
          verified: '#059669',
          reported: '#047857',
          cancelled: '#EF4444',
          stat: '#DC2626',
          urgent: '#F97316',
          routine: '#6B7280',
        },
      },

      // fontFamily: {
      //   sans: ['var(--font-geist)', 'system-ui', 'sans-serif'],
      //   mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
      // },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'monospace'],
        heading: ['var(--font-playfair)', 'serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '0.85rem' }],
      },

      animation: {
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'slide-in-up': 'slideInUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
      },

      keyframes: {
        slideInRight: {
          '0%': { transform: 'translateX(20px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
      },
    },
  },
  plugins: [],
};