
import React from "react";
import { useTheme } from "@/hooks/useTheme";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Palette, Type, Layout } from "lucide-react";
import ThemeManagementHeader from "./theme/ThemeManagementHeader";
import ColorPaletteTab from "./theme/ColorPaletteTab";
import TypographyTab from "./theme/TypographyTab";
import LayoutTab from "./theme/LayoutTab";
import ThemePreview from "./theme/ThemePreview";

const ThemeManagement = () => {
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
  } = useTheme();

  const handleColorChange = (colorKey: string, value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value
      }
    });
  };

  const handleFontChange = (fontKey: string, value: string) => {
    updateTheme({
      fonts: {
        ...theme.fonts,
        [fontKey]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      <ThemeManagementHeader 
        theme={theme}
        previewTheme={previewTheme}
        isPreviewMode={isPreviewMode}
        hasUnsavedChanges={hasUnsavedChanges}
        updateTheme={updateTheme}
        applyTheme={applyTheme}
        resetTheme={resetTheme}
        enterPreviewMode={enterPreviewMode}
        exitPreviewMode={exitPreviewMode}
      />

      <Tabs defaultValue="colors" className="space-y-4">
        <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-primary)]/30 w-full grid grid-cols-3 p-2 gap-1 rounded-lg py-0 px-[10px]">
          <TabsTrigger value="colors" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md">
            <Palette className="w-4 h-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="fonts" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md">
            <Type className="w-4 h-4 mr-2" />
            Typography
          </TabsTrigger>
          <TabsTrigger value="layout" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md">
            <Layout className="w-4 h-4 mr-2" />
            Layout
          </TabsTrigger>
        </TabsList>

        <TabsContent value="colors" className="space-y-4">
          <ColorPaletteTab theme={theme} onColorChange={handleColorChange} />
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4">
          <TypographyTab theme={theme} onFontChange={handleFontChange} />
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <LayoutTab theme={theme} updateTheme={updateTheme} />
        </TabsContent>
      </Tabs>

      <ThemePreview />
    </div>
  );
};

export default ThemeManagement;
