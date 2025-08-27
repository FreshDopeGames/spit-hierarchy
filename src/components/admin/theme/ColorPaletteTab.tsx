
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeConfig } from "@/config/theme";
import { isValidHex, getContrastTextColor } from "@/lib/utils";

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
          {Object.entries(theme.colors).map(([key, value]) => {
            const isValid = isValidHex(value);
            const contrastColor = isValid ? getContrastTextColor(value) : '#000000';
            
            return (
              <div key={key} className="space-y-2">
                <Label className="text-[var(--theme-text)] font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isValid ? value : '#000000'}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-16 h-10 p-1 border-2 border-[var(--theme-border)] bg-[var(--theme-surface)]"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className={`flex-1 bg-[var(--theme-surface)] border-2 text-[var(--theme-text)] placeholder:text-[var(--theme-textMuted)] ${
                      isValid ? 'border-[var(--theme-border)]' : 'border-red-500'
                    }`}
                    placeholder="#FFFFFF"
                  />
                </div>
                <div 
                  className="w-full h-8 rounded border-2 border-[var(--theme-border)] flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: isValid ? value : 'hsl(var(--theme-surface))',
                    color: isValid ? contrastColor : 'hsl(var(--theme-textMuted))'
                  }}
                >
                  {isValid ? 'Preview' : 'Invalid Color'}
                </div>
                {!isValid && (
                  <p className="text-red-400 text-xs">
                    Please enter a valid hex color (e.g., #FF0000)
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default ColorPaletteTab;
