
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
              <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                {key} Font
              </Label>
              <Select value={value} onValueChange={(newValue) => onFontChange(key, newValue)}>
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
  );
};

export default TypographyTab;
