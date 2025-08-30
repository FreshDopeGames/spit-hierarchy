import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedInput } from "@/components/ui/themed-input";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedThemeConfig, ElementConfig, TypographyConfig } from "@/config/enhancedTheme";
import { isValidHex } from "@/lib/utils";
import ColorDropdown from "./ColorDropdown";

interface ElementCustomizerProps {
  selectedElement: string | null;
  theme: EnhancedThemeConfig;
  onThemeUpdate: (updates: Partial<EnhancedThemeConfig>) => void;
}

const ElementCustomizer = ({ selectedElement, theme, onThemeUpdate }: ElementCustomizerProps) => {
  if (!selectedElement) {
    return (
      <ThemedCard>
        <ThemedCardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-2">
            <div className="text-[var(--theme-textMuted)] text-lg">No Element Selected</div>
            <p className="text-sm text-[var(--theme-textMuted)]">
              Click on any element in the preview to customize it
            </p>
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  const getElementConfig = (): ElementConfig | TypographyConfig | null => {
    if (selectedElement.startsWith('typography-')) {
      const typographyKey = selectedElement.replace('typography-', '') as keyof EnhancedThemeConfig['typography'];
      return theme.typography[typographyKey];
    }
    
    if (selectedElement.startsWith('button-')) {
      const buttonVariant = selectedElement.replace('button-', '') as keyof EnhancedThemeConfig['elements']['button'];
      return theme.elements.button[buttonVariant];
    }
    
    if (selectedElement in theme.elements) {
      const elementKey = selectedElement as keyof Omit<EnhancedThemeConfig['elements'], 'button'>;
      return theme.elements[elementKey] as ElementConfig;
    }
    
    return null;
  };

  const updateElementConfig = (updates: Partial<ElementConfig | TypographyConfig>) => {
    if (selectedElement.startsWith('typography-')) {
      const typographyKey = selectedElement.replace('typography-', '') as keyof EnhancedThemeConfig['typography'];
      onThemeUpdate({
        typography: {
          ...theme.typography,
          [typographyKey]: {
            ...theme.typography[typographyKey],
            ...updates
          }
        }
      });
      return;
    }
    
    if (selectedElement.startsWith('button-')) {
      const buttonVariant = selectedElement.replace('button-', '') as keyof EnhancedThemeConfig['elements']['button'];
      onThemeUpdate({
        elements: {
          ...theme.elements,
          button: {
            ...theme.elements.button,
            [buttonVariant]: {
              ...theme.elements.button[buttonVariant],
              ...updates
            }
          }
        }
      });
      return;
    }
    
    if (selectedElement in theme.elements && selectedElement !== 'button') {
      const elementKey = selectedElement as keyof Omit<EnhancedThemeConfig['elements'], 'button'>;
      onThemeUpdate({
        elements: {
          ...theme.elements,
          [elementKey]: {
            ...theme.elements[elementKey] as ElementConfig,
            ...updates
          }
        }
      });
    }
  };

  const config = getElementConfig();
  if (!config) return null;

  const isTypography = selectedElement.startsWith('typography-');
  const isElement = !isTypography;

  const elementConfig = isElement ? config as ElementConfig : null;
  const typographyConfig = isTypography ? config as TypographyConfig : null;

  const formatElementName = (element: string) => {
    return element
      .replace('-', ' ')
      .replace(/([A-Z])/g, ' $1')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle>
          Customize {formatElementName(selectedElement)}
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <Tabs defaultValue={isTypography ? "typography" : "appearance"} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="typography">Typography</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
          </TabsList>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-4">
            {(typographyConfig || elementConfig?.typography || isElement) && (
              <>
                {/* Font Size */}
                <div className="space-y-2">
                  <ThemedLabel>Font Size</ThemedLabel>
                  <div className="flex items-center gap-2">
                    <ThemedInput
                      type="text"
                      value={typographyConfig?.fontSize || elementConfig?.typography?.fontSize || '1rem'}
                      onChange={(e) => {
                        const updates = isTypography 
                          ? { fontSize: e.target.value }
                          : { typography: { ...elementConfig?.typography, fontSize: e.target.value } };
                        updateElementConfig(updates);
                      }}
                      placeholder="1rem"
                      className="flex-1"
                    />
                    <ThemedSelect
                      value={(typographyConfig?.fontSize || elementConfig?.typography?.fontSize || '1rem').includes('rem') ? 'rem' : 
                             (typographyConfig?.fontSize || elementConfig?.typography?.fontSize || '1rem').includes('px') ? 'px' : 'em'}
                      onValueChange={(unit) => {
                        const currentValue = parseFloat(typographyConfig?.fontSize || elementConfig?.typography?.fontSize || '1');
                        const newValue = `${currentValue}${unit}`;
                        const updates = isTypography 
                          ? { fontSize: newValue }
                          : { typography: { ...elementConfig?.typography, fontSize: newValue } };
                        updateElementConfig(updates);
                      }}
                    >
                      <ThemedSelectTrigger className="w-20">
                        <ThemedSelectValue />
                      </ThemedSelectTrigger>
                      <ThemedSelectContent>
                        <ThemedSelectItem value="rem">rem</ThemedSelectItem>
                        <ThemedSelectItem value="px">px</ThemedSelectItem>
                        <ThemedSelectItem value="em">em</ThemedSelectItem>
                      </ThemedSelectContent>
                    </ThemedSelect>
                  </div>
                </div>

                {/* Font Weight */}
                <div className="space-y-2">
                  <ThemedLabel>Font Weight</ThemedLabel>
                  <ThemedSelect
                    value={typographyConfig?.fontWeight || elementConfig?.typography?.fontWeight || '400'}
                    onValueChange={(value) => {
                      const updates = isTypography 
                        ? { fontWeight: value }
                        : { typography: { ...elementConfig?.typography, fontWeight: value } };
                      updateElementConfig(updates);
                    }}
                  >
                    <ThemedSelectTrigger>
                      <ThemedSelectValue />
                    </ThemedSelectTrigger>
                    <ThemedSelectContent>
                      <ThemedSelectItem value="100">Thin (100)</ThemedSelectItem>
                      <ThemedSelectItem value="200">Extra Light (200)</ThemedSelectItem>
                      <ThemedSelectItem value="300">Light (300)</ThemedSelectItem>
                      <ThemedSelectItem value="400">Regular (400)</ThemedSelectItem>
                      <ThemedSelectItem value="500">Medium (500)</ThemedSelectItem>
                      <ThemedSelectItem value="600">Semi Bold (600)</ThemedSelectItem>
                      <ThemedSelectItem value="700">Bold (700)</ThemedSelectItem>
                      <ThemedSelectItem value="800">Extra Bold (800)</ThemedSelectItem>
                      <ThemedSelectItem value="900">Black (900)</ThemedSelectItem>
                    </ThemedSelectContent>
                  </ThemedSelect>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <ThemedLabel>Line Height</ThemedLabel>
                  <ThemedInput
                    type="text"
                    value={typographyConfig?.lineHeight || elementConfig?.typography?.lineHeight || '1.5'}
                    onChange={(e) => {
                      const updates = isTypography 
                        ? { lineHeight: e.target.value }
                        : { typography: { ...elementConfig?.typography, lineHeight: e.target.value } };
                      updateElementConfig(updates);
                    }}
                    placeholder="1.5"
                  />
                </div>

                {/* Letter Spacing */}
                <div className="space-y-2">
                  <ThemedLabel>Letter Spacing</ThemedLabel>
                  <ThemedInput
                    type="text"
                    value={typographyConfig?.letterSpacing || elementConfig?.typography?.letterSpacing || 'normal'}
                    onChange={(e) => {
                      const updates = isTypography 
                        ? { letterSpacing: e.target.value }
                        : { typography: { ...elementConfig?.typography, letterSpacing: e.target.value } };
                      updateElementConfig(updates);
                    }}
                    placeholder="normal"
                  />
                </div>

                {/* Text Transform */}
                {(typographyConfig?.textTransform !== undefined || isElement) && (
                  <div className="space-y-2">
                    <ThemedLabel>Text Transform</ThemedLabel>
                    <ThemedSelect
                      value={typographyConfig?.textTransform || elementConfig?.typography?.textTransform || 'none'}
                      onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
                        const updates = isTypography 
                          ? { textTransform: value }
                          : { typography: { ...elementConfig?.typography, textTransform: value } };
                        updateElementConfig(updates);
                      }}
                    >
                      <ThemedSelectTrigger>
                        <ThemedSelectValue />
                      </ThemedSelectTrigger>
                      <ThemedSelectContent>
                        <ThemedSelectItem value="none">None</ThemedSelectItem>
                        <ThemedSelectItem value="uppercase">Uppercase</ThemedSelectItem>
                        <ThemedSelectItem value="lowercase">Lowercase</ThemedSelectItem>
                        <ThemedSelectItem value="capitalize">Capitalize</ThemedSelectItem>
                      </ThemedSelectContent>
                    </ThemedSelect>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-4">
            {isElement && elementConfig && (
              <>
                {/* Background Color */}
                <ColorDropdown
                  label="Background Color"
                  value={elementConfig.background}
                  onChange={(value) => updateElementConfig({ background: value })}
                  theme={theme}
                />

                {/* Text Color */}
                <ColorDropdown
                  label="Text Color"
                  value={elementConfig.color}
                  onChange={(value) => updateElementConfig({ color: value })}
                  theme={theme}
                />

                {/* Hover States for Dropdown Items */}
                {selectedElement === 'dropdown_item' && (
                  <>
                    <ColorDropdown
                      label="Hover Background"
                      value={elementConfig.hoverBackground}
                      onChange={(value) => updateElementConfig({ hoverBackground: value })}
                      theme={theme}
                    />
                    
                    <ColorDropdown
                      label="Hover Text Color"
                      value={elementConfig.hoverColor}
                      onChange={(value) => updateElementConfig({ hoverColor: value })}
                      theme={theme}
                    />
                  </>
                )}

                {/* Gradient */}
                {theme.gradients.length > 0 && (
                  <div className="space-y-2">
                    <ThemedLabel>Gradient (overrides background)</ThemedLabel>
                    <ThemedSelect
                      value={elementConfig.gradient || 'none'}
                      onValueChange={(value) => updateElementConfig({ 
                        gradient: value === 'none' ? undefined : value 
                      })}
                    >
                      <ThemedSelectTrigger>
                        <ThemedSelectValue />
                      </ThemedSelectTrigger>
                      <ThemedSelectContent>
                        <ThemedSelectItem value="none">No Gradient</ThemedSelectItem>
                        {theme.gradients.map((gradient) => (
                          <ThemedSelectItem key={gradient.id} value={gradient.id}>
                            {gradient.name}
                          </ThemedSelectItem>
                        ))}
                      </ThemedSelectContent>
                    </ThemedSelect>
                  </div>
                )}

                <Separator />

                {/* Border Controls */}
                <div className="space-y-4">
                  <ThemedLabel className="text-base font-semibold">Border</ThemedLabel>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ThemedLabel>Width</ThemedLabel>
                      <ThemedInput
                        type="text"
                        value={elementConfig.border?.width || '1px'}
                        onChange={(e) => updateElementConfig({
                          border: { ...elementConfig.border, width: e.target.value, style: elementConfig.border?.style || 'solid', color: elementConfig.border?.color || '#000000', radius: elementConfig.border?.radius || '4px' }
                        })}
                        placeholder="1px"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <ThemedLabel>Style</ThemedLabel>
                      <ThemedSelect
                        value={elementConfig.border?.style || 'solid'}
                        onValueChange={(value: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge') => 
                          updateElementConfig({
                            border: { ...elementConfig.border, style: value, width: elementConfig.border?.width || '1px', color: elementConfig.border?.color || '#000000', radius: elementConfig.border?.radius || '4px' }
                          })
                        }
                      >
                        <ThemedSelectTrigger>
                          <ThemedSelectValue />
                        </ThemedSelectTrigger>
                        <ThemedSelectContent>
                          <ThemedSelectItem value="solid">Solid</ThemedSelectItem>
                          <ThemedSelectItem value="dashed">Dashed</ThemedSelectItem>
                          <ThemedSelectItem value="dotted">Dotted</ThemedSelectItem>
                          <ThemedSelectItem value="double">Double</ThemedSelectItem>
                          <ThemedSelectItem value="groove">Groove</ThemedSelectItem>
                          <ThemedSelectItem value="ridge">Ridge</ThemedSelectItem>
                        </ThemedSelectContent>
                      </ThemedSelect>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ColorDropdown
                        label="Color"
                        value={elementConfig.border?.color}
                        onChange={(value) => updateElementConfig({
                          border: { ...elementConfig.border, color: value, width: elementConfig.border?.width || '1px', style: elementConfig.border?.style || 'solid', radius: elementConfig.border?.radius || '4px' }
                        })}
                        theme={theme}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <ThemedLabel>Radius</ThemedLabel>
                      <ThemedInput
                        type="text"
                        value={elementConfig.border?.radius || '4px'}
                        onChange={(e) => updateElementConfig({
                          border: { ...elementConfig.border, radius: e.target.value, width: elementConfig.border?.width || '1px', style: elementConfig.border?.style || 'solid', color: elementConfig.border?.color || '#000000' }
                        })}
                        placeholder="4px"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Spacing */}
                <div className="space-y-4">
                  <ThemedLabel className="text-base font-semibold">Spacing</ThemedLabel>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <ThemedLabel>Padding</ThemedLabel>
                      <ThemedInput
                        type="text"
                        value={elementConfig.padding || ''}
                        onChange={(e) => updateElementConfig({ padding: e.target.value })}
                        placeholder="1rem"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <ThemedLabel>Margin</ThemedLabel>
                      <ThemedInput
                        type="text"
                        value={elementConfig.margin || ''}
                        onChange={(e) => updateElementConfig({ margin: e.target.value })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Shadow */}
                <div className="space-y-2">
                  <ThemedLabel>Box Shadow</ThemedLabel>
                  <ThemedInput
                    type="text"
                    value={elementConfig.shadow || ''}
                    onChange={(e) => updateElementConfig({ shadow: e.target.value })}
                    placeholder="0 4px 6px rgba(0, 0, 0, 0.1)"
                  />
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default ElementCustomizer;