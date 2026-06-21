/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enables class-based dark/light mode toggle
  theme: {
    extend: {
      colors: {
        cyber: {
          bg: '#080B11',
          card: 'rgba(13, 18, 30, 0.45)',
          lightBg: '#F3F4F6',
          lightCard: 'rgba(255, 255, 255, 0.75)',
          cyan: '#00F2FE',
          purple: '#9d4edd',
          blue: '#4FACFE',
          green: '#00FF87',
          red: '#FF007F',
          yellow: '#FFD700',
          border: 'rgba(0, 242, 254, 0.15)',
          borderPurple: 'rgba(157, 78, 221, 0.15)',
          borderLight: 'rgba(0, 0, 0, 0.08)',
        }
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'neon-cyan': '0 0 15px rgba(0, 242, 254, 0.25)',
        'neon-purple': '0 0 15px rgba(157, 78, 221, 0.25)',
        'neon-green': '0 0 15px rgba(0, 255, 135, 0.25)',
        'neon-red': '0 0 15px rgba(255, 0, 127, 0.25)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'scan': 'scanSweep 3s linear infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'radar': 'radarSweep 4s linear infinite',
        'grid-scroll': 'gridScroll 20s linear infinite',
      },
      keyframes: {
        scanSweep: {
          '0%': { transform: 'translateY(-100%)' },
          '50%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(-100%)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.3', boxShadow: '0 0 15px rgba(0, 242, 254, 0.15)' },
          '50%': { opacity: '0.8', boxShadow: '0 0 25px rgba(0, 242, 254, 0.45)' },
        },
        radarSweep: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        gridScroll: {
          '0%': { backgroundPositionY: '0px' },
          '100%': { backgroundPositionY: '40px' },
        }
      }
    },
  },
  plugins: [],
}
