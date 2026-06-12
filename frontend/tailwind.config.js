/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page:    '#0A0A0F',
        card:    '#111118',
        raised:  '#1A1A24',
        border:  '#2A2A38',
        accent:  '#00C2A8',
        'accent-dim': '#0D3D30',
        success: '#22C55E',
        'success-dim': '#0D2A1A',
        warning: '#F59E0B',
        'warning-dim': '#2A1F06',
        danger:  '#EF4444',
        'danger-dim':  '#2A0D0D',
        't1':    '#F0F0F5',
        't2':    '#8888A0',
        't3':    '#555570',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}
