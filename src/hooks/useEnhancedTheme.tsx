import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  EnhancedThemeConfig, 
  defaultEnhancedTheme, 
  applyEnhancedThemeToDOM,
  getCurrentEnhancedTheme,
  saveEnhancedTheme,
  ENHANCED_THEME_STORAGE_KEY
} from '@/config/enhancedTheme';

interface EnhancedThemeContextType {
  theme: EnhancedThemeConfig;
  previewTheme: EnhancedThemeConfig | null;
  isPreviewMode: boolean;
  hasUnsavedChanges: boolean;
  updateTheme: (updates: Partial<EnhancedThemeConfig>) => void;
  applyTheme: () => void;
  resetTheme: () => void;
  enterPreviewMode: () => void;
  exitPreviewMode: () => void;
}

const EnhancedThemeContext = createContext<EnhancedThemeContextType | null>(null);

interface EnhancedThemeProviderProps {
  children: ReactNode;
}

export const EnhancedThemeProvider: React.FC<EnhancedThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<EnhancedThemeConfig>(getCurrentEnhancedTheme());
  const [previewTheme, setPreviewTheme] = useState<EnhancedThemeConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Apply theme to DOM on mount and when theme changes
  useEffect(() => {
    const themeToApply = previewTheme || theme;
    applyEnhancedThemeToDOM(themeToApply);
  }, [theme, previewTheme]);

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = getCurrentEnhancedTheme();
    setTheme(savedTheme);
    applyEnhancedThemeToDOM(savedTheme);
  }, []);

  const updateTheme = (updates: Partial<EnhancedThemeConfig>) => {
    if (isPreviewMode) {
      const currentTheme = previewTheme || theme;
      const updatedTheme = { ...currentTheme, ...updates };
      setPreviewTheme(updatedTheme);
    } else {
      const updatedTheme = { ...theme, ...updates };
      setTheme(updatedTheme);
    }
  };

  const applyTheme = () => {
    if (previewTheme) {
      setTheme(previewTheme);
      saveEnhancedTheme(previewTheme);
      setPreviewTheme(null);
      setIsPreviewMode(false);
    }
  };

  const resetTheme = () => {
    setTheme(defaultEnhancedTheme);
    setPreviewTheme(null);
    setIsPreviewMode(false);
    try {
      localStorage.removeItem(ENHANCED_THEME_STORAGE_KEY);
    } catch (error) {
      console.error('Error removing theme from storage:', error);
    }
  };

  const enterPreviewMode = () => {
    setIsPreviewMode(true);
    setPreviewTheme(theme);
  };

  const exitPreviewMode = () => {
    setIsPreviewMode(false);
    setPreviewTheme(null);
  };

  const hasUnsavedChanges = isPreviewMode && previewTheme !== null;

  const contextValue: EnhancedThemeContextType = {
    theme,
    previewTheme,
    isPreviewMode,
    hasUnsavedChanges,
    updateTheme,
    applyTheme,
    resetTheme,
    enterPreviewMode,
    exitPreviewMode,
  };

  return (
    <EnhancedThemeContext.Provider value={contextValue}>
      {children}
    </EnhancedThemeContext.Provider>
  );
};

export const useEnhancedTheme = (): EnhancedThemeContextType => {
  const context = useContext(EnhancedThemeContext);
  if (!context) {
    throw new Error('useEnhancedTheme must be used within an EnhancedThemeProvider');
  }
  return context;
};