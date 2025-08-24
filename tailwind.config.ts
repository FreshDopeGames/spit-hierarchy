

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
				// Ancient Egyptian + Futuristic rap culture themed colors
				'rap': {
					'burgundy': '#800020',
					'burgundy-light': '#A0002A',
					'burgundy-dark': '#600018',
					'forest': '#4CAF50',
					'forest-light': '#66BB6A',
					'forest-dark': '#388E3C',
					'gold': '#E59517',
					'gold-light': '#FAC42B',
					'gold-dark': '#C1740C',
					'carbon': '#0D0D0D',
					'carbon-light': '#1A1A1A',
					'silver': '#C0C0C0',
					'platinum': '#E5E4E2',
					'smoke': '#848884',
					'charcoal': '#36454F'
				}
			},
			fontFamily: {
				'kaushan': ['Kaushan Script', 'cursive'],
				'mogra': ['Mogra', 'cursive'],
				'ceviche': ['Ceviche One', 'cursive'],
				'merienda': ['Merienda', 'serif'],
			},
			backgroundImage: {
				'rap-carbon': 'radial-gradient(circle at 25% 25%, #2A2A2A 2%, transparent 3%), radial-gradient(circle at 75% 75%, #2A2A2A 2%, transparent 3%), linear-gradient(45deg, #1C1C1C 25%, transparent 25%, transparent 75%, #1C1C1C 75%, #1C1C1C), linear-gradient(-45deg, #1C1C1C 25%, transparent 25%, transparent 75%, #1C1C1C 75%, #1C1C1C)',
				'carbon-gradient': 'linear-gradient(135deg, #000000 0%, #36454F 50%, #0D0D0D 100%)',
				'vinyl': 'repeating-conic-gradient(from 0deg at 50% 50%, #1C1C1C 0deg 2deg, #2A2A2A 2deg 4deg)',
				'hieroglyph': 'linear-gradient(45deg, #D4AF37 0%, transparent 25%), linear-gradient(-45deg, #D4AF37 0%, transparent 25%), radial-gradient(circle at 50% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
				'pyramid': 'linear-gradient(135deg, #D4AF37 0%, #B7950B 50%, #0D0D0D 100%)',
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
				'vinyl-spin': {
					'0%': { transform: 'rotate(0deg)' },
					'100%': { transform: 'rotate(360deg)' }
				},
				'pharaoh-rise': {
					'0%': { transform: 'translateY(100px) scale(0.8)', opacity: '0' },
					'50%': { transform: 'translateY(50px) scale(0.9)', opacity: '0.5' },
					'100%': { transform: 'translateY(0) scale(1)', opacity: '1' }
				},
				'hieroglyph-float': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-10px) rotate(1deg)' },
					'66%': { transform: 'translateY(5px) rotate(-1deg)' }
				},
				'slow-bounce': {
					'0%, 100%': { 
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'25%': { 
						transform: 'translateY(-15px)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					},
					'50%': { 
						transform: 'translateY(0)',
						animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)'
					},
					'75%': { 
						transform: 'translateY(-15px)',
						animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'vinyl-spin': 'vinyl-spin 3s linear infinite',
				'pharaoh-rise': 'pharaoh-rise 1s ease-out',
				'hieroglyph-float': 'hieroglyph-float 4s ease-in-out infinite',
				'slow-bounce': 'slow-bounce 2s ease-in-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;

