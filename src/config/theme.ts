
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
    primary: '45 85% 55%', // rap-gold HSL - matches current site
    primaryLight: '48 89% 70%',
    primaryDark: '42 80% 38%',
    secondary: '346 100% 25%', // rap-burgundy HSL - matches current site
    secondaryLight: '346 100% 32%',
    secondaryDark: '346 100% 18%',
    accent: '122 39% 49%', // rap-forest HSL
    accentLight: '122 36% 58%',
    accentDark: '122 48% 40%',
    background: '0 0% 5%', // rap-carbon HSL - matches current site
    backgroundLight: '0 0% 10%', // rap-carbon-light HSL
    backgroundDark: '0 0% 0%',
    surface: '0 0% 17%',
    text: '60 8% 90%', // rap-platinum HSL - matches current site
    textLight: '0 0% 100%',
    textMuted: '0 0% 75%', // bright silver HSL
    border: '45 85% 55%', // Use primary gold for borders to match current site
    success: '122 39% 49%',
    warning: '36 100% 50%',
    error: '4 90% 58%',
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
  
  // Apply color variables (HSL format)
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--theme-${key}`, value);
    // Also set core variables for primary colors to ensure consistency
    if (key === 'primary') {
      root.style.setProperty('--primary', value);
    }
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
