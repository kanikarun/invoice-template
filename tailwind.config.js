const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['selector'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './modules/**/*.{ts,tsx}',
    './themes/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}'
  ],
  theme: {
    corePlugins: {
      aspectRatio: false
    },
    container: {
      center: true,
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
          50: 'hsl(var(--primary-50))',
          100: 'hsl(var(--primary-100))',
          200: 'hsl(var(--primary-200))',
          300: 'hsl(var(--primary-300))',
          400: 'hsl(var(--primary-400))',
          500: 'hsl(var(--primary-500))',
          600: 'hsl(var(--primary-600))',
          700: 'hsl(var(--primary-700))',
          800: 'hsl(var(--primary-800))',
          900: 'hsl(var(--primary-900))',
          950: 'hsl(var(--primary-950))'
        },
        // primary: {
        //   DEFAULT: '#c21111',
        //   foreground: 'hsl(var(--primary-foreground))',
        //   '50': '#fff1f1',
        //   '100': '#ffe0e0',
        //   '200': '#ffc6c6',
        //   '300': '#ff9f9f',
        //   '400': '#ff6868',
        //   '500': '#fb3838',
        //   '600': '#e91919',
        //   '700': '#c21111',
        //   '800': '#a21212',
        //   '900': '#861616',
        //   '950': '#490606',
        // },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        kny: {
          DEFAULT: '#FFF9E3',
          foreground: '#BE8E58'
        },
        classy: {
          50: '#fef8ec',
          100: '#fbecca',
          200: '#f7d892',
          300: '#f3bd56',
          400: '#f0a52f',
          500: '#e98517',
          600: '#ce6211',
          700: '#ab4412',
          800: '#8b3515',
          900: '#722d15',
          950: '#411507'
        },
        kampuchea: {
          50: '#fff9e3',
          100: '#fff3c0',
          200: '#eed7b2',
          300: '#cfbb9a',
          400: '#b19f83',
          500: '#93856d',
          600: '#82472a',
          700: '#6a3c24',
          800: '#423b2f',
          900: '#2a251d',
          950: '#14110c'
        },
        mobile: {
          dark: '#18181a'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'var(--font-sans-kh)', ...fontFamily.sans]
        // heading: ["var(--font-heading)", ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/container-queries'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('tailwind-scrollbar')({ nocompatible: true, preferredStrategy: 'pseudoelements' })
  ]
};
