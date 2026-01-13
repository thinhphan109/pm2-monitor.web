/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx}',
        './components/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                // Core Dark Backgrounds
                'bg-primary': '#020617', // slate-950
                'bg-secondary': '#0f172a', // slate-900

                // Glass Panel Colors
                glass: {
                    DEFAULT: 'rgba(15, 23, 42, 0.5)',
                    light: 'rgba(15, 23, 42, 0.3)',
                    heavy: 'rgba(15, 23, 42, 0.7)',
                    border: 'rgba(51, 65, 85, 0.5)',
                },

                // Primary Accent (Indigo-Violet Gradient)
                accent: {
                    DEFAULT: '#818cf8', // indigo-400
                    light: '#a5b4fc', // indigo-300
                    dark: '#6366f1', // indigo-500
                },

                // Status Colors
                status: {
                    online: '#34d399', // emerald-400
                    'online-glow': 'rgba(52, 211, 153, 0.2)',
                    error: '#f43f5e', // rose-500
                    'error-glow': 'rgba(244, 63, 94, 0.2)',
                    warning: '#fbbf24', // amber-400
                    'warning-glow': 'rgba(251, 191, 36, 0.2)',
                    info: '#60a5fa', // blue-400
                    'info-glow': 'rgba(96, 165, 250, 0.2)',
                    stopped: '#fbbf24', // amber-400
                    offline: '#f43f5e', // rose-500
                },

                // Text Colors
                'text-primary': '#e2e8f0', // slate-200
                'text-secondary': '#94a3b8', // slate-400
                'text-muted': '#64748b', // slate-500
            },

            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
            },

            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                'gradient-glow': 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
            },

            boxShadow: {
                'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                'glass-sm': '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
                'glow-primary': '0 0 20px rgba(99, 102, 241, 0.3)',
                'glow-success': '0 0 20px rgba(52, 211, 153, 0.3)',
                'glow-error': '0 0 20px rgba(244, 63, 94, 0.3)',
                'glow-warning': '0 0 20px rgba(251, 191, 36, 0.3)',
            },

            backdropBlur: {
                xs: '2px',
            },

            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },

            keyframes: {
                glow: {
                    '0%': { boxShadow: '0 0 5px rgba(99, 102, 241, 0.2)' },
                    '100%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)' },
                },
            },
        },
    },
    plugins: [],
};
