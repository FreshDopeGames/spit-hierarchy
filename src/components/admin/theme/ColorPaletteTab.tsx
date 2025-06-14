
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeConfig } from "@/config/theme";

interface ColorPaletteTabProps {
  theme: ThemeConfig;
  onColorChange: (colorKey: string, value: string) => void;
}

const ColorPaletteTab = ({ theme, onColorChange }: ColorPaletteTabProps) => {
  return (
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
                  onChange={(e) => onColorChange(key, e.target.value)}
                  className="w-16 h-10 p-1 border-[var(--theme-border)]"
                />
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => onColorChange(key, e.target.value)}
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
  );
};

export default ColorPaletteTab;
