
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig, getCurrentTheme, saveTheme, applyThemeToDOM } from '@/config/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(getCurrentTheme);

  useEffect(() => {
    // Apply theme to DOM on mount and when theme changes
    applyThemeToDOM(theme);
  }, [theme]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    const newTheme = { ...theme, ...updates };
    setTheme(newTheme);
    saveTheme(newTheme);
  };

  const resetTheme = () => {
    const defaultTheme = getCurrentTheme();
    setTheme(defaultTheme);
    localStorage.removeItem('spit-hierarchy-theme');
    applyThemeToDOM(defaultTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme, resetTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
