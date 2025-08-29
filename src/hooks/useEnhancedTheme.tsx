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
      // Automatically enter preview mode when making changes
      const updatedTheme = { ...theme, ...updates };
      setPreviewTheme(updatedTheme);
      setIsPreviewMode(true);
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

  // Deep comparison helper
  const deepEqual = (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (obj1 == null || obj2 == null) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }
    
    return true;
  };

  const hasUnsavedChanges = previewTheme !== null && !deepEqual(theme, previewTheme);

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