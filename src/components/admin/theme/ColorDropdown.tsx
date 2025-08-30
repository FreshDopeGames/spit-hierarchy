import React from "react";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { ThemedLabel } from "@/components/ui/themed-label";
import { EnhancedThemeConfig } from "@/config/enhancedTheme";
import { hslToHex } from "@/lib/utils";

interface ColorDropdownProps {
  label: string;
  value: string | undefined;
  onChange: (value: string) => void;
  theme: EnhancedThemeConfig;
  allowSpecialValues?: boolean;
}

const ColorDropdown = ({ label, value, onChange, theme, allowSpecialValues = true }: ColorDropdownProps) => {
  const colorOptions = Object.entries(theme.colors).map(([key, hslValue]) => ({
    key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1'),
    hsl: hslValue,
    hex: hslToHex(hslValue)
  }));

  const specialOptions = allowSpecialValues ? [
    { key: 'transparent', name: 'Transparent', hex: 'transparent', hsl: 'transparent' },
    { key: 'none', name: 'None', hex: 'transparent', hsl: 'transparent' },
  ] : [];

  const allOptions = [...specialOptions, ...colorOptions];

  // Find the current selection - check if it matches a theme color key or hsl/hex value
  const getCurrentValue = () => {
    if (!value) return 'none';
    
    // Check if value is a theme color key
    if (theme.colors[value as keyof typeof theme.colors]) {
      return value;
    }
    
    // Check if value matches a theme color hsl or hex
    const matchingColor = Object.entries(theme.colors).find(([, hslValue]) => 
      hslValue === value || hslToHex(hslValue) === value
    );
    if (matchingColor) {
      return matchingColor[0];
    }
    
    // Check special values
    if (value === 'transparent' || value === 'none') {
      return value === 'none' ? 'none' : 'transparent';
    }
    
    // If no match found, return the first option
    return allOptions[0]?.key || 'none';
  };

  // Get display color for current selection
  const getCurrentDisplayColor = () => {
    const currentKey = getCurrentValue();
    if (currentKey === 'none' || currentKey === 'transparent') {
      return 'transparent';
    }
    const colorOption = colorOptions.find(opt => opt.key === currentKey);
    return colorOption?.hex || 'transparent';
  };

  const handleValueChange = (selectedKey: string) => {
    if (selectedKey === 'none') {
      onChange('');
    } else if (selectedKey === 'transparent') {
      onChange('transparent');
    } else {
      // Get the theme color key, not the hex value
      onChange(selectedKey);
    }
  };

  return (
    <div className="space-y-2">
      <ThemedLabel>{label}</ThemedLabel>
      <ThemedSelect value={getCurrentValue()} onValueChange={handleValueChange}>
        <ThemedSelectTrigger>
          <div className="flex items-center gap-2">
            {getCurrentValue() !== 'none' && (
              <div 
                className="w-4 h-4 rounded border border-[var(--theme-border)]"
                style={{ 
                  backgroundColor: getCurrentDisplayColor(),
                  backgroundImage: getCurrentDisplayColor() === 'transparent' ? 
                    'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                  backgroundSize: getCurrentDisplayColor() === 'transparent' ? '8px 8px' : 'auto',
                  backgroundPosition: getCurrentDisplayColor() === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                }}
              />
            )}
            <ThemedSelectValue />
          </div>
        </ThemedSelectTrigger>
        <ThemedSelectContent>
          {allOptions.map((option) => (
            <ThemedSelectItem key={option.key} value={option.key}>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded border border-[var(--theme-border)]"
                  style={{ 
                    backgroundColor: option.hex === 'transparent' ? 'transparent' : option.hex,
                    backgroundImage: option.hex === 'transparent' ? 
                      'linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)' : 'none',
                    backgroundSize: option.hex === 'transparent' ? '8px 8px' : 'auto',
                    backgroundPosition: option.hex === 'transparent' ? '0 0, 0 4px, 4px -4px, -4px 0px' : 'auto'
                  }}
                />
                <span>{option.name}</span>
                {option.hex !== 'transparent' && option.hex && (
                  <span className="text-[var(--theme-textMuted)] text-xs ml-auto">
                    {option.hex}
                  </span>
                )}
              </div>
            </ThemedSelectItem>
          ))}
        </ThemedSelectContent>
      </ThemedSelect>
    </div>
  );
};

export default ColorDropdown;