/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        stone: {
          warm: '#D4C5A9',
          light: '#F5F0E8',
          dark: '#6F6450',
        },
        olive: {
          light: '#7A8B4A',
          DEFAULT: '#4A5D23',
          dark: '#2E3B16',
        },
        terracotta: {
          light: '#D4956B',
          DEFAULT: '#C67D4A',
          dark: '#A0603A',
        },
        parchment: '#FAF7F0',
        charcoal: '#2C2C2C',
        gold: {
          warm: '#C9A84C',
          light: '#E8D48B',
        },
        /* Epirotan tones (H·01) */
        kerameidi: '#7A2E1F',
        kyparissi: '#2B4A3A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['"Source Sans 3"', 'system-ui', 'sans-serif'],
        accent: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'stone-texture': "url('/images/stone-texture.svg')",
        'warm-gradient': 'linear-gradient(135deg, #FAF7F0 0%, #F5F0E8 50%, #E8DFD0 100%)',
        'hero-overlay': 'linear-gradient(180deg, rgba(44,44,44,0.1) 0%, rgba(44,44,44,0.6) 100%)',
        'gold-accent': 'linear-gradient(90deg, #C9A84C 0%, #E8D48B 50%, #C9A84C 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.8s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.8s ease-out forwards',
        'slide-in-right': 'slideInRight 0.8s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};
