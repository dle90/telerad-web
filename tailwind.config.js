export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // ── Primary: Clinical Blue ──────────────────────────────────────────
        primary: {
          25:  '#F5F8FF',
          50:  '#EEF4FF',
          100: '#E0EAFF',
          200: '#C7D7FD',
          300: '#A4BCFA',
          400: '#7A9EF8',
          500: '#4E78F1',
          600: '#2D5FE8',   // ← main primary (slightly more vibrant)
          700: '#1A4FD6',
          800: '#1B42B5',
          900: '#1B3A8F',
          950: '#112668',
        },
        // ── Teal: Healthcare accent ─────────────────────────────────────────
        teal: {
          50:  '#F0FDFA',
          100: '#CCFBF1',
          200: '#99F6E4',
          300: '#5EEAD4',
          400: '#2DD4BF',
          500: '#14B8A6',
          600: '#0891B2',   // ← cyan-teal (slightly brighter)
          700: '#0E7490',
          800: '#155E75',
          900: '#164E63',
        },
        // ── Success (Emerald) ───────────────────────────────────────────────
        success: {
          50:  '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
        },
        // ── Warning (Amber) ─────────────────────────────────────────────────
        warning: {
          50:  '#fffbeb',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
        },
        // ── Danger (Red) ────────────────────────────────────────────────────
        danger: {
          50:  '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
        },
        // ── Neutral (Slate) ─────────────────────────────────────────────────
        neutral: {
          0:   '#ffffff',
          50:  '#f8fafc',
          100: '#f1f5f9',
          150: '#eaeff5',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        // ── Semantic surface tokens ─────────────────────────────────────────────────
        surface: {
          page:     '#F6F8FB',  // main page background — light blue-white
          card:     '#FFFFFF',  // card / panel surface
          elevated: '#FFFFFF',  // modal / dropdown elevated surface
          subtle:   '#EEF2F8',  // subtle tinted background
          inset:    '#E8EEF6',  // input bg, code block, inset areas
          hover:    '#EEF3FD',  // hover state — blue-tinted
          active:   '#E0EBFF',  // active / selected — stronger blue tint
          selected: '#DBEAFE',  // strongly selected (primary-100 equivalent)
          overlay:  'rgba(15, 23, 42, 0.45)', // modal overlay
        },
        // ── Semantic border tokens ──────────────────────────────────────────────────
        border: {
          subtle:  '#EDF1F7',  // hairline / very subtle dividers
          default: '#DDE3EC',  // standard input + card borders
          strong:  '#C4CFDE',  // emphasized borders
          focus:   '#2D5FE8',  // focus ring (matches primary-600)
          active:  '#A4BCFA',  // active border (primary-300)
        },
        // ── Status light backgrounds ────────────────────────────────────────────────
        status: {
          'info-bg':    '#EEF4FF',  // info surface
          'info-text':  '#1B42B5',  // info text
          'ok-bg':      '#ECFDF5',  // success surface
          'ok-text':    '#065F46',  // success text
          'warn-bg':    '#FFFBEB',  // warning surface
          'warn-text':  '#92400E',  // warning text
          'err-bg':     '#FFF1F1',  // danger surface
          'err-text':   '#991B1B',  // danger text
          'neutral-bg': '#F8FAFC',  // neutral surface
          'neutral-text':'#334155', // neutral text
        },
        // ── Sidebar tokens ──────────────────────────────────────────────────
        sidebar: {
          DEFAULT:       '#0B1628',
          hover:         '#14243E',
          active:        '#2D5FE8',
          border:        '#182847',
          text:          '#7AAEC9',
          'text-muted':  '#48698A',
          'text-active': '#FFFFFF',
          'text-group':  '#3A5F7C',
        },
      },

      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'system-ui', '-apple-system', 'Helvetica Neue', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Menlo', 'Consolas', 'monospace'],
      },

      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem',    letterSpacing: '0.01em' }],
        '3xs': ['0.625rem',  { lineHeight: '0.875rem', letterSpacing: '0.02em' }],
        '13':  ['0.8125rem', { lineHeight: '1.5',     letterSpacing: '-0.01em' }],
        '11':  ['0.6875rem', { lineHeight: '1.4',     letterSpacing: '0' }],
        '10':  ['0.625rem',  { lineHeight: '1.2',     letterSpacing: '0.04em' }],
        '15':  ['0.9375rem', { lineHeight: '1.35',    letterSpacing: '-0.015em' }],
      },

      boxShadow: {
        xs:      '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        card:    '0 1px 3px 0 rgb(0 0 0 / 0.07), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
        'card-md':'0 4px 8px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
        'card-lg':'0 8px 16px -4px rgb(0 0 0 / 0.1), 0 4px 8px -4px rgb(0 0 0 / 0.06)',
        modal:   '0 24px 48px -8px rgb(0 0 0 / 0.2), 0 8px 16px -4px rgb(0 0 0 / 0.1)',
        dropdown:'0 8px 16px -2px rgb(0 0 0 / 0.1), 0 2px 4px -1px rgb(0 0 0 / 0.06)',
        input:   '0 1px 2px 0 rgb(0 0 0 / 0.04)',
        'input-focus': '0 0 0 3px rgb(37 99 235 / 0.12)',
        inner:   'inset 0 1px 3px 0 rgb(0 0 0 / 0.06)',
      },

      borderRadius: {
        '4':  '1rem',
        '5':  '1.25rem',
        '6':  '1.5rem',
      },

      spacing: {
        '18': '4.5rem',
        '56': '14rem',
        '68': '17rem',
        '72': '18rem',
        '88': '22rem',
      },

      animation: {
        'fade-in':   'fadeIn 0.15s ease-out',
        'slide-up':  'slideUp 0.18s ease-out',
        'scale-in':  'scaleIn 0.15s ease-out',
        'slide-in-left': 'slideInLeft 0.2s ease-out',
        'pulse-slow':'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { opacity: '0', transform: 'translateY(6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%':   { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        slideInLeft: {
          '0%':   { opacity: '0', transform: 'translateX(-8px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },

      transitionDuration: {
        '0': '0ms',
      },

      zIndex: {
        60:  '60',
        70:  '70',
        80:  '80',
        90:  '90',
        100: '100',
      },
    },
  },
  plugins: [],
}
