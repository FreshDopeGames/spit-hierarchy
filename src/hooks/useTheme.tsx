
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ThemeConfig, getCurrentTheme, saveTheme, applyThemeToDOM, defaultTheme } from '@/config/theme';

interface ThemeContextType {
  theme: ThemeConfig;
  previewTheme: ThemeConfig | null;
  isPreviewMode: boolean;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  applyTheme: () => void;
  resetTheme: () => void;
  enterPreviewMode: () => void;
  exitPreviewMode: () => void;
  hasUnsavedChanges: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeConfig>(getCurrentTheme);
  const [previewTheme, setPreviewTheme] = useState<ThemeConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  useEffect(() => {
    // Apply theme to DOM on mount and when theme changes
    applyThemeToDOM(previewTheme || theme);
  }, [theme, previewTheme]);

  const updateTheme = (updates: Partial<ThemeConfig>) => {
    if (isPreviewMode) {
      const newPreviewTheme = { 
        ...previewTheme, 
        colors: { ...previewTheme?.colors, ...updates.colors },
        fonts: { ...previewTheme?.fonts, ...updates.fonts },
        ...updates 
      };
      setPreviewTheme(newPreviewTheme);
    } else {
      const newTheme = { 
        ...theme, 
        colors: { ...theme.colors, ...updates.colors },
        fonts: { ...theme.fonts, ...updates.fonts },
        ...updates 
      };
      setPreviewTheme(newTheme);
      setIsPreviewMode(true);
    }
  };

  const applyTheme = () => {
    if (previewTheme) {
      setTheme(previewTheme);
      saveTheme(previewTheme);
      setPreviewTheme(null);
      setIsPreviewMode(false);
    }
  };

  const resetTheme = () => {
    setTheme(defaultTheme);
    setPreviewTheme(null);
    setIsPreviewMode(false);
    localStorage.removeItem('spit-hierarchy-theme');
    applyThemeToDOM(defaultTheme);
  };

  const enterPreviewMode = () => {
    if (!isPreviewMode) {
      setPreviewTheme(theme);
      setIsPreviewMode(true);
    }
  };

  const exitPreviewMode = () => {
    setPreviewTheme(null);
    setIsPreviewMode(false);
    applyThemeToDOM(theme);
  };

  const hasUnsavedChanges = isPreviewMode && previewTheme !== null;

  return (
    <ThemeContext.Provider value={{ 
      theme: previewTheme || theme, 
      previewTheme,
      isPreviewMode,
      updateTheme, 
      applyTheme,
      resetTheme,
      enterPreviewMode,
      exitPreviewMode,
      hasUnsavedChanges
    }}>
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
