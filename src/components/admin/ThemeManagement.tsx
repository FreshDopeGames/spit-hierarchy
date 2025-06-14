
import React, { useState } from "react";
import { useTheme } from "@/hooks/useTheme";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Type, Layout, Undo, Save, Download, Upload } from "lucide-react";
import { toast } from "sonner";

const ThemeManagement = () => {
  const { theme, updateTheme, resetTheme } = useTheme();
  const [previewMode, setPreviewMode] = useState(false);

  const handleColorChange = (colorKey: string, value: string) => {
    updateTheme({
      colors: {
        ...theme.colors,
        [colorKey]: value,
      },
    });
  };

  const handleFontChange = (fontKey: string, value: string) => {
    updateTheme({
      fonts: {
        ...theme.fonts,
        [fontKey]: value,
      },
    });
  };

  const exportTheme = () => {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spit-hierarchy-theme.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Theme exported successfully');
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        updateTheme(importedTheme);
        toast.success('Theme imported successfully');
      } catch (error) {
        toast.error('Error importing theme');
      }
    };
    reader.readAsText(file);
  };

  const fontOptions = [
    { value: 'Mogra, cursive', label: 'Mogra (Display)' },
    { value: 'Kaushan Script, cursive', label: 'Kaushan Script (Script)' },
    { value: 'Ceviche One, cursive', label: 'Ceviche One (Fun)' },
    { value: 'Inter, sans-serif', label: 'Inter (Clean)' },
    { value: 'Roboto, sans-serif', label: 'Roboto (Modern)' },
    { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant)' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono (Code)' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-[var(--theme-font-heading)] text-[var(--theme-primary)] font-mogra">
          Theme Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <ThemedButton variant="outline" onClick={exportTheme} className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
            <Download className="w-4 h-4 mr-2" />
            Export
          </ThemedButton>
          <label className="w-full sm:w-auto">
            <ThemedButton variant="outline" asChild className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </span>
            </ThemedButton>
            <input
              type="file"
              accept=".json"
              onChange={importTheme}
              className="hidden"
            />
          </label>
          <ThemedButton variant="destructive" onClick={resetTheme} className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
            <Undo className="w-4 h-4 mr-2" />
            Reset
          </ThemedButton>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-4">
        <div className="overflow-x-auto">
          <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-border)] w-full min-w-max flex-nowrap sm:flex-wrap sm:min-w-0">
            <TabsTrigger value="colors" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              <Palette className="w-4 h-4 mr-2" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="fonts" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              <Type className="w-4 h-4 mr-2" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="layout" className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-2 whitespace-nowrap">
              <Layout className="w-4 h-4 mr-2" />
              Layout
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="colors" className="space-y-4">
          <ThemedCard>
            <ThemedCardHeader>
              <ThemedCardTitle>Color Palette</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(theme.colors).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="w-16 h-10 p-1 border-[var(--theme-border)]"
                      />
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => handleColorChange(key, e.target.value)}
                        className="flex-1 bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
                      />
                    </div>
                    <div 
                      className="w-full h-8 rounded border border-[var(--theme-border)]"
                      style={{ backgroundColor: value }}
                    />
                  </div>
                ))}
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </TabsContent>

        <TabsContent value="fonts" className="space-y-4">
          <ThemedCard>
            <ThemedCardHeader>
              <ThemedCardTitle>Typography Settings</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(theme.fonts).map(([key, value]) => (
                  <div key={key} className="space-y-2">
                    <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                      {key} Font
                    </Label>
                    <Select value={value} onValueChange={(newValue) => handleFontChange(key, newValue)}>
                      <SelectTrigger className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[var(--theme-surface)] border-[var(--theme-border)]">
                        {fontOptions.map((font) => (
                          <SelectItem 
                            key={font.value} 
                            value={font.value}
                            className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)] hover:text-[var(--theme-background)]"
                          >
                            <span style={{ fontFamily: font.value }}>
                              {font.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div 
                      className="p-3 bg-[var(--theme-background)] border border-[var(--theme-border)] rounded text-[var(--theme-text)]"
                      style={{ fontFamily: value }}
                    >
                      Sample text in {key} font
                    </div>
                  </div>
                ))}
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </TabsContent>

        <TabsContent value="layout" className="space-y-4">
          <ThemedCard>
            <ThemedCardHeader>
              <ThemedCardTitle>Layout & Spacing</ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-primary)]">Border Radius</h4>
                  {Object.entries(theme.borderRadius).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                        {key} Radius
                      </Label>
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => updateTheme({
                          borderRadius: { ...theme.borderRadius, [key]: e.target.value }
                        })}
                        className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
                      />
                    </div>
                  ))}
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-primary)]">Spacing</h4>
                  {Object.entries(theme.spacing).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                        {key} Spacing
                      </Label>
                      <Input
                        type="text"
                        value={value}
                        onChange={(e) => updateTheme({
                          spacing: { ...theme.spacing, [key]: e.target.value }
                        })}
                        className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </TabsContent>
      </Tabs>

      {/* Preview Section */}
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle>Theme Preview</ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ThemedButton variant="default">Primary Button</ThemedButton>
              <ThemedButton variant="secondary">Secondary Button</ThemedButton>
              <ThemedButton variant="accent">Accent Button</ThemedButton>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <ThemedButton variant="outline">Outline Button</ThemedButton>
              <ThemedButton variant="gradient">Gradient Button</ThemedButton>
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]">
                Heading Text (H1)
              </h1>
              <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
                Subheading Text (H2)
              </h2>
              <p className="font-[var(--theme-font-body)] text-[var(--theme-text)]">
                Body text using the body font. This is how regular content will appear.
              </p>
              <p className="font-[var(--theme-font-display)] text-[var(--theme-primary)] text-xl">
                Display text for special emphasis and branding.
              </p>
              <code className="font-[var(--theme-font-code)] text-[var(--theme-textMuted)] bg-[var(--theme-surface)] px-2 py-1 rounded">
                Code font for technical content
              </code>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
};

export default ThemeManagement;
