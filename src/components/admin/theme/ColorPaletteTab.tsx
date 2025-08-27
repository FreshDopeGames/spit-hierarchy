
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
                <Label className="text-white font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={isValid ? value : '#000000'}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-16 h-10 p-1 border-2 border-gray-300 bg-white"
                  />
                  <Input
                    type="text"
                    value={value}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className={`flex-1 bg-white border-2 text-black placeholder:text-gray-500 ${
                      isValid ? 'border-gray-300' : 'border-red-500'
                    }`}
                    placeholder="#FFFFFF"
                  />
                </div>
                <div 
                  className="w-full h-8 rounded border-2 border-gray-300 flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: isValid ? value : '#CCCCCC',
                    color: isValid ? contrastColor : '#666666'
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
