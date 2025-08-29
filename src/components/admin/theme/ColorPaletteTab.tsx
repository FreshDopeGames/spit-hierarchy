
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { Button } from "@/components/ui/button";
import { EnhancedThemeConfig, GradientConfig, gradientToCSS } from "@/config/enhancedTheme";
import { isValidHex, getContrastTextColor, hslToHex, hexToHsl } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";
import ColorDropdown from "./ColorDropdown";

interface ColorPaletteTabProps {
  theme: EnhancedThemeConfig;
  onColorChange: (colorKey: string, value: string) => void;
}

const ColorPaletteTab = ({ theme, onColorChange }: ColorPaletteTabProps) => {
  // Filter out gradient properties from colors
  const colorEntries = Object.entries(theme.colors).filter(([key]) => !key.startsWith('gradient'));

  const handleGradientChange = (gradients: GradientConfig[]) => {
    // Update the theme's gradients array
    (onColorChange as any)('gradients', gradients);
  };

  const addGradientStop = (gradientId: string, stop: { color: string; position: number }) => {
    const updatedGradients = theme.gradients.map(gradient => {
      if (gradient.id === gradientId) {
        return {
          ...gradient,
          stops: [...gradient.stops, stop].sort((a, b) => a.position - b.position)
        };
      }
      return gradient;
    });
    handleGradientChange(updatedGradients);
  };

  const removeGradientStop = (gradientId: string, stopIndex: number) => {
    const updatedGradients = theme.gradients.map(gradient => {
      if (gradient.id === gradientId) {
        return {
          ...gradient,
          stops: gradient.stops.filter((_, index) => index !== stopIndex)
        };
      }
      return gradient;
    });
    handleGradientChange(updatedGradients);
  };

  const updateGradientStop = (gradientId: string, stopIndex: number, updates: Partial<{ color: string; position: number }>) => {
    const updatedGradients = theme.gradients.map(gradient => {
      if (gradient.id === gradientId) {
        return {
          ...gradient,
          stops: gradient.stops.map((stop, index) => 
            index === stopIndex ? { ...stop, ...updates } : stop
          )
        };
      }
      return gradient;
    });
    handleGradientChange(updatedGradients);
  };

  const updateGradient = (gradientId: string, updates: Partial<GradientConfig>) => {
    const updatedGradients = theme.gradients.map(gradient => 
      gradient.id === gradientId ? { ...gradient, ...updates } : gradient
    );
    handleGradientChange(updatedGradients);
  };

  return (
    <div className="space-y-6">
      {/* Color Palette Section */}
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle>Color Palette</ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorEntries.map(([key, value]) => {
            const handleColorChange = (colorKey: string) => {
              onColorChange(key, colorKey);
            };
            
            return (
              <div key={key} className="space-y-2">
                <ColorDropdown
                  label={key.replace(/([A-Z])/g, ' $1').trim()}
                  value={key}
                  onChange={handleColorChange}
                  theme={theme}
                  allowSpecialValues={false}
                />
                <div 
                  className="w-full h-8 rounded border-2 border-[var(--theme-border)] flex items-center justify-center text-xs font-medium"
                  style={{ 
                    backgroundColor: `hsl(${value})`,
                    color: getContrastTextColor(hslToHex(value))
                  }}
                >
                  Preview
                </div>
              </div>
              );
            })}
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* Gradients Section */}
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle>Gradients</ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="space-y-4">
            {theme.gradients.map((gradient) => (
              <div key={gradient.id} className="space-y-3 p-4 border border-[var(--theme-border)] rounded-lg">
                <div className="flex items-center gap-4">
                  {/* Gradient Preview */}
                  <div 
                    className="w-20 h-10 rounded border-2 border-[var(--theme-border)]"
                    style={{ background: gradientToCSS(gradient) }}
                  />
                  
                  {/* Gradient Name */}
                  <div className="flex-1">
                    <ThemedLabel>Name</ThemedLabel>
                    <ThemedInput
                      value={gradient.name}
                      onChange={(e) => updateGradient(gradient.id, { name: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  
                  {/* Gradient Type */}
                  <div className="w-32">
                    <ThemedLabel>Type</ThemedLabel>
                    <ThemedSelect
                      value={gradient.type}
                      onValueChange={(value: 'linear' | 'radial' | 'conic') => 
                        updateGradient(gradient.id, { type: value })}
                    >
                      <ThemedSelectTrigger className="mt-1">
                        <ThemedSelectValue />
                      </ThemedSelectTrigger>
                      <ThemedSelectContent>
                        <ThemedSelectItem value="linear">Linear</ThemedSelectItem>
                        <ThemedSelectItem value="radial">Radial</ThemedSelectItem>
                        <ThemedSelectItem value="conic">Conic</ThemedSelectItem>
                      </ThemedSelectContent>
                    </ThemedSelect>
                  </div>
                  
                  {/* Direction (for linear gradients) */}
                  {gradient.type === 'linear' && (
                    <div className="w-24">
                      <ThemedLabel>Direction</ThemedLabel>
                      <ThemedInput
                        type="number"
                        value={gradient.direction}
                        onChange={(e) => updateGradient(gradient.id, { direction: parseInt(e.target.value) || 0 })}
                        className="mt-1"
                        min="0"
                        max="360"
                      />
                    </div>
                  )}
                </div>
                
                {/* Color Stops */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <ThemedLabel>Color Stops</ThemedLabel>
                    <Button
                      size="sm"
                      onClick={() => addGradientStop(gradient.id, { color: '#ffffff', position: 50 })}
                      className="flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      Add Stop
                    </Button>
                  </div>
                  
                  <div className="space-y-2">
                    {gradient.stops.map((stop, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <ThemedInput
                          type="color"
                          value={stop.color}
                          onChange={(e) => updateGradientStop(gradient.id, index, { color: e.target.value })}
                          className="w-12 h-8 p-1"
                        />
                        <ThemedInput
                          type="text"
                          value={stop.color}
                          onChange={(e) => updateGradientStop(gradient.id, index, { color: e.target.value })}
                          className="flex-1"
                          placeholder="#ffffff"
                        />
                        <ThemedInput
                          type="number"
                          value={stop.position}
                          onChange={(e) => updateGradientStop(gradient.id, index, { position: parseInt(e.target.value) || 0 })}
                          className="w-16"
                          min="0"
                          max="100"
                        />
                        <span className="text-xs text-[var(--theme-textMuted)]">%</span>
                        {gradient.stops.length > 2 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => removeGradientStop(gradient.id, index)}
                            className="p-1 w-8 h-8"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    </div>
  );
};

export default ColorPaletteTab;
