
import { hexToHsl } from '@/lib/utils';

export interface ThemeConfig {
  colors: {
    primary: string;
    primaryLight: string;
    primaryDark: string;
    secondary: string;
    secondaryLight: string;
    secondaryDark: string;
    accent: string;
    accentLight: string;
    accentDark: string;
    background: string;
    backgroundLight: string;
    backgroundDark: string;
    surface: string;
    text: string;
    textLight: string;
    textMuted: string;
    border: string;
    success: string;
    warning: string;
    error: string;
  };
  fonts: {
    heading: string;
    body: string;
    display: string;
    code: string;
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  borderRadius: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
}

export const defaultTheme: ThemeConfig = {
  colors: {
    primary: '#D4AF37', // rap-gold - matches current site
    primaryLight: '#E8C547',
    primaryDark: '#B8941F',
    secondary: '#800020', // rap-burgundy - matches current site
    secondaryLight: '#A6002A',
    secondaryDark: '#5A0016',
    accent: '#6B8E23', // rap-forest
    accentLight: '#7BA428',
    accentDark: '#5A7A1E',
    background: '#0D0D0D', // rap-carbon - matches current site
    backgroundLight: '#1A1A1A', // rap-carbon-light
    backgroundDark: '#000000',
    surface: '#2B2B2B',
    text: '#E8E6E3', // rap-platinum - matches current site
    textLight: '#FFFFFF',
    textMuted: '#BFBFBF', // bright silver
    border: '#D4AF37', // Use primary gold for borders to match current site
    success: '#6B8E23',
    warning: '#FF8C00',
    error: '#DC143C',
  },
  fonts: {
    heading: 'Mogra, cursive', // Matches current site usage
    body: 'Merienda, serif', // Matches current site usage
    display: 'Ceviche One, cursive',
    code: 'JetBrains Mono, monospace',
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '2rem',
    xl: '4rem',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
    xl: '16px',
  },
  shadows: {
    sm: '0 1px 2px rgba(212, 175, 55, 0.1)',
    md: '0 4px 6px rgba(212, 175, 55, 0.1)',
    lg: '0 10px 15px rgba(212, 175, 55, 0.2)',
    xl: '0 20px 25px rgba(212, 175, 55, 0.3)',
  },
};

// Theme storage key
export const THEME_STORAGE_KEY = 'spit-hierarchy-theme';

// Get current theme from localStorage or default
export const getCurrentTheme = (): ThemeConfig => {
  if (typeof window === 'undefined') return defaultTheme;
  
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored) {
      return { ...defaultTheme, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error('Error loading theme from storage:', error);
  }
  
  return defaultTheme;
};

// Save theme to localStorage (no longer auto-applies)
export const saveTheme = (theme: Partial<ThemeConfig>): void => {
  try {
    const currentTheme = getCurrentTheme();
    const newTheme = { ...currentTheme, ...theme };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(newTheme));
  } catch (error) {
    console.error('Error saving theme to storage:', error);
  }
};

// Apply theme to DOM as CSS custom properties (now separate from saving)
export const applyThemeToDOM = (theme: ThemeConfig): void => {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color variables (convert hex to HSL for CSS custom properties)
  Object.entries(theme.colors).forEach(([key, value]) => {
    // Convert hex to HSL format for CSS variables
    const hslValue = value.startsWith('#') ? hexToHsl(value) : value;
    root.style.setProperty(`--theme-${key}`, hslValue);
    
    // Also set standard shadcn variables to ensure UI components use theme colors
    if (key === 'primary') {
      root.style.setProperty('--primary', hslValue);
    }
    if (key === 'background') {
      root.style.setProperty('--background', hslValue);
    }
    if (key === 'surface') {
      root.style.setProperty('--muted', hslValue);
    }
    if (key === 'text') {
      root.style.setProperty('--foreground', hslValue);
      root.style.setProperty('--muted-foreground', hslValue);
    }
  });
  
  // Apply font variables
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });
  
  // Apply font scaling class based on heading font
  const body = document.body;
  // Remove existing theme font classes
  body.classList.remove('theme-font-ceviche', 'theme-font-mogra', 'theme-font-merienda');
  
  // Add appropriate class based on heading font
  if (theme.fonts.heading.includes('Ceviche One')) {
    body.classList.add('theme-font-ceviche');
  } else if (theme.fonts.heading.includes('Mogra')) {
    body.classList.add('theme-font-mogra');
  } else if (theme.fonts.heading.includes('Merienda')) {
    body.classList.add('theme-font-merienda');
  }
  
  // Apply spacing variables
  Object.entries(theme.spacing).forEach(([key, value]) => {
    root.style.setProperty(`--theme-spacing-${key}`, value);
  });
  
  // Apply border radius variables
  Object.entries(theme.borderRadius).forEach(([key, value]) => {
    root.style.setProperty(`--theme-radius-${key}`, value);
  });
  
  // Apply shadow variables
  Object.entries(theme.shadows).forEach(([key, value]) => {
    root.style.setProperty(`--theme-shadow-${key}`, value);
  });
};
