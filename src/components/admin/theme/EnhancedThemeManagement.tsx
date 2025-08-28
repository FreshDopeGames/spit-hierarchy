import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, Type, Wand2, Layout, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { EnhancedThemeConfig, defaultEnhancedTheme, applyEnhancedThemeToDOM } from "@/config/enhancedTheme";
import EnhancedThemePreview from "./EnhancedThemePreview";
import ColorPaletteTab from "./ColorPaletteTab";
import TypographyTab from "./TypographyTab";
import GradientBuilder from "./GradientBuilder";
import ElementCustomizer from "./ElementCustomizer";
import { toast } from "sonner";

const EnhancedThemeManagement = () => {
  const [theme, setTheme] = useState<EnhancedThemeConfig>(defaultEnhancedTheme);
  const [previewTheme, setPreviewTheme] = useState<EnhancedThemeConfig | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  // Toast notifications handled by sonner

  const currentTheme = previewTheme || theme;

  const handleThemeUpdate = (updates: Partial<EnhancedThemeConfig>) => {
    const newTheme = {
      ...currentTheme,
      colors: { ...currentTheme.colors, ...updates.colors },
      fonts: { ...currentTheme.fonts, ...updates.fonts },
      typography: { ...currentTheme.typography, ...updates.typography },
      gradients: updates.gradients || currentTheme.gradients,
      elements: { ...currentTheme.elements, ...updates.elements },
      ...updates
    };

    setPreviewTheme(newTheme);
    setIsPreviewMode(true);
    applyEnhancedThemeToDOM(newTheme);
  };

  const handleColorChange = (colorKey: string, value: string) => {
    handleThemeUpdate({
      colors: {
        ...currentTheme.colors,
        [colorKey]: value
      }
    });
  };

  const handleFontChange = (fontKey: string, value: string) => {
    handleThemeUpdate({
      fonts: {
        ...currentTheme.fonts,
        [fontKey]: value
      }
    });
  };

  const handleGradientChange = (gradients: any[]) => {
    handleThemeUpdate({ gradients });
  };

  const handleApplyTheme = () => {
    if (previewTheme) {
      setTheme(previewTheme);
      // Save to localStorage
      try {
        localStorage.setItem('enhanced-theme', JSON.stringify(previewTheme));
      } catch (error) {
        console.error('Error saving theme:', error);
      }
      setPreviewTheme(null);
      setIsPreviewMode(false);
      toast.success("Theme changes have been saved successfully.");
    }
  };

  const handleResetTheme = () => {
    setTheme(defaultEnhancedTheme);
    setPreviewTheme(null);
    setIsPreviewMode(false);
    applyEnhancedThemeToDOM(defaultEnhancedTheme);
    try {
      localStorage.removeItem('enhanced-theme');
    } catch (error) {
      console.error('Error removing theme:', error);
    }
    toast.success("Theme has been reset to default settings.");
  };

  const handleExitPreview = () => {
    setPreviewTheme(null);
    setIsPreviewMode(false);
    applyEnhancedThemeToDOM(theme);
    toast.info("Returned to saved theme settings.");
  };

  const hasUnsavedChanges = isPreviewMode && previewTheme !== null;

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex items-center justify-between p-4 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded-lg">
        <div>
          <h2 className="text-xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]">
            Enhanced Theme Management
          </h2>
          <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
            Customize every aspect of your application's appearance
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {hasUnsavedChanges && (
            <>
              <Button
                variant="outline"
                onClick={handleExitPreview}
                className="flex items-center gap-2"
              >
                <EyeOff className="w-4 h-4" />
                Exit Preview
              </Button>
              <Button
                onClick={handleApplyTheme}
                className="flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                Apply Changes
              </Button>
            </>
          )}
          <Button
            variant="outline"
            onClick={handleResetTheme}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Preview Mode Indicator */}
      {isPreviewMode && (
        <div className="bg-[var(--theme-accent)]/10 border border-[var(--theme-accent)] rounded-lg p-3">
          <div className="flex items-center gap-2 text-[var(--theme-accent)]">
            <Eye className="w-4 h-4" />
            <span className="font-medium">Preview Mode Active</span>
            <span className="text-sm opacity-80">
              - Changes are temporary until applied
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Main Controls */}
        <div className="space-y-6">
          <Tabs defaultValue="colors" className="space-y-4">
            <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 w-full grid grid-cols-5 p-2 gap-1 rounded-lg">
              <TabsTrigger 
                value="colors" 
                className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-2 py-2 rounded-md"
              >
                <Palette className="w-4 h-4 mr-1" />
                Colors
              </TabsTrigger>
              <TabsTrigger 
                value="typography" 
                className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-2 py-2 rounded-md"
              >
                <Type className="w-4 h-4 mr-1" />
                Fonts
              </TabsTrigger>
              <TabsTrigger 
                value="gradients" 
                className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-2 py-2 rounded-md"
              >
                <Wand2 className="w-4 h-4 mr-1" />
                Gradients
              </TabsTrigger>
              <TabsTrigger 
                value="elements" 
                className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-2 py-2 rounded-md"
              >
                <Layout className="w-4 h-4 mr-1" />
                Elements
              </TabsTrigger>
              <TabsTrigger 
                value="preview" 
                className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-2 py-2 rounded-md"
              >
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-4">
              <ColorPaletteTab theme={currentTheme} onColorChange={handleColorChange} />
            </TabsContent>

            <TabsContent value="typography" className="space-y-4">
              <TypographyTab theme={currentTheme} onFontChange={handleFontChange} />
            </TabsContent>

            <TabsContent value="gradients" className="space-y-4">
              <GradientBuilder
                gradients={currentTheme.gradients}
                onGradientChange={handleGradientChange}
                selectedGradient={selectedGradient}
                onSelectGradient={setSelectedGradient}
              />
            </TabsContent>

            <TabsContent value="elements" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <EnhancedThemePreview
                  theme={currentTheme}
                  selectedElement={selectedElement}
                  onElementSelect={setSelectedElement}
                />
                <ElementCustomizer
                  selectedElement={selectedElement}
                  theme={currentTheme}
                  onThemeUpdate={handleThemeUpdate}
                />
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-4">
              <EnhancedThemePreview
                theme={currentTheme}
                selectedElement={selectedElement}
                onElementSelect={setSelectedElement}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <EnhancedThemePreview
            theme={currentTheme}
            selectedElement={selectedElement}
            onElementSelect={setSelectedElement}
          />
        </div>
      </div>
    </div>
  );
};

export default EnhancedThemeManagement;