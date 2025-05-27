
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
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
					foreground: 'hsl(var(--primary-foreground))'
				},
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
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Rap culture themed colors - neutral and dark
				'rap': {
					'burgundy': '#800020',
					'burgundy-light': '#A0002A',
					'burgundy-dark': '#600018',
					'forest': '#355E3B',
					'forest-light': '#4A7C59',
					'forest-dark': '#2B4C32',
					'carbon': '#1C1C1C',
					'carbon-light': '#2A2A2A',
					'silver': '#C0C0C0',
					'platinum': '#E5E4E2',
					'smoke': '#848884'
				}
			},
			fontFamily: {
				'rap': ['Nerko One', 'cursive'],
				'graffiti': ['Permanent Marker', 'cursive'],
				'street': ['Sedgwick Ave Display', 'cursive'],
			},
			backgroundImage: {
				'carbon-fiber': 'radial-gradient(circle at 25% 25%, #2A2A2A 2%, transparent 3%), radial-gradient(circle at 75% 75%, #2A2A2A 2%, transparent 3%), linear-gradient(45deg, #1C1C1C 25%, transparent 25%, transparent 75%, #1C1C1C 75%, #1C1C1C), linear-gradient(-45deg, #1C1C1C 25%, transparent 25%, transparent 75%, #1C1C1C 75%, #1C1C1C)',
				'vinyl': 'repeating-conic-gradient(from 0deg at 50% 50%, #1C1C1C 0deg 2deg, #2A2A2A 2deg 4deg)',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 20px rgba(128, 0, 32, 0.5)' 
					},
					'50%': { 
						boxShadow: '0 0 40px rgba(128, 0, 32, 0.8)' 
					}
				},
				'text-glow': {
					'0%, 100%': { 
						textShadow: '0 0 10px rgba(192, 192, 192, 0.8)' 
					},
					'50%': { 
						textShadow: '0 0 20px rgba(192, 192, 192, 1)' 
					}
				},
				'vinyl-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'text-glow': 'text-glow 2s ease-in-out infinite',
				'vinyl-spin': 'vinyl-spin 3s linear infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
