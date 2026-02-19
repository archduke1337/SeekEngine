module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'SF Mono', 'Fira Code', 'monospace'],
        display: ['Space Grotesk', 'JetBrains Mono', 'sans-serif'],
      },
      colors: {
        retro: {
          cyan: '#00fff0',
          pink: '#ff006a',
          purple: '#b400ff',
          dark: '#0a0a0f',
          surface: '#12121a',
        },
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        'text-shimmer': {
          '0%': { backgroundPosition: '200% center' },
          '100%': { backgroundPosition: '-200% center' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2)', opacity: '0' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'glow-pulse': {
          '0%, 100%': { opacity: '0.4', transform: 'scale(1)' },
          '50%': { opacity: '0.8', transform: 'scale(1.05)' },
        },
        'dot-pulse': {
          '0%, 80%, 100%': { opacity: '0.3', transform: 'scale(0.8)' },
          '40%': { opacity: '1', transform: 'scale(1)' },
        },
        'title-shimmer': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'border-spin': {
          from: { '--border-angle': '0deg' },
          to: { '--border-angle': '360deg' },
        },
        'scanline': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'flicker': {
          '0%, 100%': { opacity: '1' },
          '92%': { opacity: '1' },
          '93%': { opacity: '0.8' },
          '94%': { opacity: '1' },
          '96%': { opacity: '0.9' },
          '97%': { opacity: '1' },
        },
        'terminal-blink': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(0,255,240,0.15)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(0,255,240,0.15)' },
        },
      },
      animation: {
        shimmer: 'shimmer 2s infinite linear',
        'text-shimmer': 'text-shimmer 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'pulse-ring': 'pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'gradient-shift': 'gradient-shift 8s ease infinite',
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'dot-pulse-1': 'dot-pulse 1.4s ease-in-out infinite',
        'dot-pulse-2': 'dot-pulse 1.4s ease-in-out 0.2s infinite',
        'dot-pulse-3': 'dot-pulse 1.4s ease-in-out 0.4s infinite',
        'title-shimmer': 'title-shimmer 8s ease-in-out infinite',
        'border-spin': 'border-spin 4s linear infinite',
        'scanline': 'scanline 8s linear infinite',
        'flicker': 'flicker 4s ease-in-out infinite',
        'terminal-blink': 'terminal-blink 1s steps(1) infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
      },
      backgroundSize: {
        'gradient-xl': '200% 200%',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  darkMode: "class",
}
