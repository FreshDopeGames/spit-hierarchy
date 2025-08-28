
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { ThemeConfig } from "@/config/theme";

interface TypographyTabProps {
  theme: ThemeConfig;
  onFontChange: (fontKey: string, value: string) => void;
}

const TypographyTab = ({ theme, onFontChange }: TypographyTabProps) => {
  const fontOptions = [
    { value: 'Mogra, cursive', label: 'Mogra (Display)' },
    { value: 'Merienda, serif', label: 'Merienda (Body/Serif)' },
    { value: 'Kaushan Script, cursive', label: 'Kaushan Script (Script)' },
    { value: 'Ceviche One, cursive', label: 'Ceviche One (Fun)' },
    { value: 'Inter, sans-serif', label: 'Inter (Clean)' },
    { value: 'Roboto, sans-serif', label: 'Roboto (Modern)' },
    { value: 'Playfair Display, serif', label: 'Playfair Display (Elegant)' },
    { value: 'JetBrains Mono, monospace', label: 'JetBrains Mono (Code)' },
    { value: 'Arial, sans-serif', label: 'Arial (System)' },
    { value: 'Georgia, serif', label: 'Georgia (System Serif)' },
  ];

  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle>Typography Settings</ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(theme.fonts).map(([key, value]) => (
            <div key={key} className="space-y-2">
              <ThemedLabel className="capitalize">
                {key} Font
              </ThemedLabel>
              <ThemedSelect value={value} onValueChange={(newValue) => onFontChange(key, newValue)}>
                <ThemedSelectTrigger>
                  <ThemedSelectValue />
                </ThemedSelectTrigger>
                <ThemedSelectContent>
                  {fontOptions.map((font) => (
                    <ThemedSelectItem 
                      key={font.value} 
                      value={font.value}
                    >
                      <span style={{ fontFamily: font.value }}>
                        {font.label}
                      </span>
                    </ThemedSelectItem>
                  ))}
                </ThemedSelectContent>
              </ThemedSelect>
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
  );
};

export default TypographyTab;
