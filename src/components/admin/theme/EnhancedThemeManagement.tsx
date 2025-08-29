import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Palette, Type, Wand2, Layout, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import { useEnhancedTheme } from "@/hooks/useEnhancedTheme";
import EnhancedThemePreview from "./EnhancedThemePreview";
import ColorPaletteTab from "./ColorPaletteTab";
import TypographyTab from "./TypographyTab";
import GradientBuilder from "./GradientBuilder";
import ElementCustomizer from "./ElementCustomizer";
import { toast } from "sonner";

const EnhancedThemeManagement = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [selectedGradient, setSelectedGradient] = useState<string | null>(null);
  
  const {
    theme,
    previewTheme,
    isPreviewMode,
    hasUnsavedChanges,
    updateTheme,
    applyTheme,
    resetTheme,
    enterPreviewMode,
    exitPreviewMode
  } = useEnhancedTheme();

  const currentTheme = previewTheme || theme;

  const handleColorChange = (colorKey: string, value: string) => {
    if (colorKey === 'gradients') {
      updateTheme({ gradients: value as any });
    } else {
      updateTheme({
        colors: {
          ...currentTheme.colors,
          [colorKey]: value
        }
      });
    }
  };

  const handleFontChange = (fontKey: string, value: string) => {
    updateTheme({
      fonts: {
        ...currentTheme.fonts,
        [fontKey]: value
      }
    });
  };

  const handleGradientChange = (gradients: any[]) => {
    updateTheme({ gradients });
  };

  const handleApplyTheme = () => {
    applyTheme();
    toast.success("Theme changes have been saved successfully.");
  };

  const handleResetTheme = () => {
    resetTheme();
    toast.success("Theme has been reset to default settings.");
  };

  const handleExitPreview = () => {
    exitPreviewMode();
    toast.info("Returned to saved theme settings.");
  };

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
          {isPreviewMode && (
            <Button
              variant="outline"
              onClick={handleExitPreview}
              className="flex items-center gap-2"
            >
              <EyeOff className="w-4 h-4" />
              Exit Preview
            </Button>
          )}
          <Button
            onClick={handleApplyTheme}
            disabled={!hasUnsavedChanges}
            className="flex items-center gap-2"
            title={hasUnsavedChanges ? "Apply theme changes" : "No changes to apply"}
          >
            <Save className="w-4 h-4" />
            {hasUnsavedChanges ? "Apply Changes" : "No Changes"}
          </Button>
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

      {/* Main Controls */}
      <div className="space-y-6">
        <Tabs defaultValue="colors" className="space-y-4">
          <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 w-full grid grid-cols-4 p-2 gap-1 rounded-lg">
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
                onThemeUpdate={updateTheme}
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
    </div>
  );
};

export default EnhancedThemeManagement;