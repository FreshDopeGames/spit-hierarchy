
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemeConfig } from "@/config/theme";
import { isValidHex, getContrastTextColor, hslToHex, hexToHsl } from "@/lib/utils";

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
            // Convert HSL to hex for display (value might be in HSL format like "45 85% 55%")
            const hexValue = value.startsWith('#') ? value : hslToHex(value);
            const isValidHexColor = isValidHex(hexValue);
            const contrastColor = isValidHexColor ? getContrastTextColor(hexValue) : '#000000';
            
            const handleColorChange = (newHex: string) => {
              // Convert hex back to HSL format for theme storage
              const hslValue = hexToHsl(newHex);
              onColorChange(key, hslValue);
            };
            
            return (
              <div key={key} className="space-y-2">
                <ThemedLabel className="capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </ThemedLabel>
                <div className="flex gap-2">
                  <ThemedInput
                    type="color"
                    value={isValidHexColor ? hexValue : '#000000'}
                    onChange={(e) => handleColorChange(e.target.value)}
                    className="w-16 h-10 p-1"
                  />
                  <ThemedInput
                    type="text"
                    value={hexValue}
                    onChange={(e) => {
                      if (isValidHex(e.target.value)) {
                        handleColorChange(e.target.value);
                      } else {
                        // Allow direct editing, validation will show error
                        onColorChange(key, e.target.value);
                      }
                    }}
                    className={`flex-1 ${
                      !isValidHexColor ? 'border-red-500' : ''
                    }`}
                    placeholder={hexValue}
                  />
                </div>
                <div 
                  className="w-full h-8 rounded border-2 border-[var(--theme-border)] flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: isValidHexColor ? hexValue : 'hsl(var(--theme-surface))',
                    color: isValidHexColor ? contrastColor : 'hsl(var(--theme-textMuted))'
                  }}
                >
                  {isValidHexColor ? 'Preview' : 'Invalid Color'}
                </div>
                {!isValidHexColor && (
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
