/** @type {import('tailwindcss').Config} */
export default {
    content: ['./index.html', './src/**/*.{js,jsx}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
                mono: ['JetBrains Mono', 'monospace'],
            },
            colors: {
                brand: {
                    50: '#f0f4ff',
                    100: '#e0e9ff',
                    200: '#c3d2fe',
                    300: '#a3b8fd',
                    400: '#7c98fa',
                    500: '#5b78f5',
                    600: '#4358ea',
                    700: '#3644d4',
                    800: '#2d39aa',
                    900: '#293489',
                },
                cyber: {
                    400: '#00d4ff',
                    500: '#00b8e8',
                    600: '#0099cc',
                },
                neon: {
                    green: '#39ff14',
                    pink: '#ff006e',
                    purple: '#bf00ff',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'float': 'float 6s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite',
                'scan': 'scan 2s linear infinite',
                'gradient': 'gradient 8s ease infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                glow: {
                    '0%, 100%': { boxShadow: '0 0 20px rgba(91,120,245,0.3)' },
                    '50%': { boxShadow: '0 0 40px rgba(91,120,245,0.8), 0 0 80px rgba(0,212,255,0.3)' },
                },
                scan: {
                    '0%': { transform: 'translateY(-100%)' },
                    '100%': { transform: 'translateY(100vh)' },
                },
                gradient: {
                    '0%, 100%': { backgroundPosition: '0% 50%' },
                    '50%': { backgroundPosition: '100% 50%' },
                }
            },
            backdropBlur: {
                xs: '2px',
            },
        },
    },
    plugins: [],
}
