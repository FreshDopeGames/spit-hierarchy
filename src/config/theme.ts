
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
    primary: '#D4AF37', // rap-gold
    primaryLight: '#F7DC6F',
    primaryDark: '#B7950B',
    secondary: '#800020', // rap-burgundy
    secondaryLight: '#A0002A',
    secondaryDark: '#600018',
    accent: '#4CAF50', // rap-forest
    accentLight: '#66BB6A',
    accentDark: '#388E3C',
    background: '#0D0D0D', // rap-carbon
    backgroundLight: '#1A1A1A',
    backgroundDark: '#000000',
    surface: '#2A2A2A',
    text: '#E5E4E2', // rap-platinum
    textLight: '#FFFFFF',
    textMuted: '#848884', // rap-smoke
    border: '#404040',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
  },
  fonts: {
    heading: 'Mogra, cursive',
    body: 'Merienda, serif', // Changed from Kaushan Script to match site usage
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
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
  });
  
  // Apply font variables
  Object.entries(theme.fonts).forEach(([key, value]) => {
    root.style.setProperty(`--theme-font-${key}`, value);
  });
  
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
