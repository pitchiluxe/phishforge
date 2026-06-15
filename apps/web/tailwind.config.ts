import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
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
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
        /* Cyberpunk named tokens */
        matrix: '#00ff41',
        cyber: '#00ffff',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-fira-sans)', 'Fira Sans', 'system-ui', 'sans-serif'],
        mono: ['var(--font-fira-code)', 'Fira Code', 'monospace'],
        code: ['var(--font-fira-code)', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        neon: '0 0 8px rgba(0,255,65,0.5), 0 0 20px rgba(0,255,65,0.2)',
        'neon-lg': '0 0 16px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.25)',
        'neon-cyan': '0 0 8px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.2)',
      },
      animation: {
        'fade-in': 'fadeSlideUp 0.25s ease-out both',
        'slide-up': 'slideUp 0.3s ease-out both',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'neon-pulse': 'neonPulse 2s ease-in-out infinite',
        glitch: 'glitch 4s infinite linear',
        blink: 'blink 1s step-end infinite',
        'matrix-rain': 'matrixRain 3s linear infinite',
        'status-blink': 'blinkDot 2s ease-in-out infinite',
      },
      keyframes: {
        fadeSlideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        neonPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0,255,65,0.3), 0 0 20px rgba(0,255,65,0.1)' },
          '50%': { boxShadow: '0 0 16px rgba(0,255,65,0.6), 0 0 40px rgba(0,255,65,0.2)' },
        },
        glitch: {
          '0%,90%,100%': { transform: 'translate(0)', filter: 'none' },
          '91%': { transform: 'translate(-2px, 1px)', filter: 'hue-rotate(90deg)' },
          '93%': { transform: 'translate(2px, -1px)', filter: 'hue-rotate(-90deg)' },
          '95%': { transform: 'translate(-1px, 2px)', filter: 'brightness(1.4)' },
          '97%': { transform: 'translate(1px, -2px)', filter: 'hue-rotate(180deg)' },
        },
        blink: {
          '0%,100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        blinkDot: {
          '0%,100%': { opacity: '1', boxShadow: '0 0 6px #00ff41, 0 0 12px rgba(0,255,65,0.5)' },
          '50%': { opacity: '0.4', boxShadow: '0 0 2px #00ff41' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
