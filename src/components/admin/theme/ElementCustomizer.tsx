import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EnhancedThemeConfig, ElementConfig, TypographyConfig } from "@/config/enhancedTheme";
import { isValidHex } from "@/lib/utils";

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
            {(typographyConfig || elementConfig?.typography) && (
              <>
                {/* Font Size */}
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <div className="flex items-center gap-2">
                    <Input
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
                    <Select
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
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rem">rem</SelectItem>
                        <SelectItem value="px">px</SelectItem>
                        <SelectItem value="em">em</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Font Weight */}
                <div className="space-y-2">
                  <Label>Font Weight</Label>
                  <Select
                    value={typographyConfig?.fontWeight || elementConfig?.typography?.fontWeight || '400'}
                    onValueChange={(value) => {
                      const updates = isTypography 
                        ? { fontWeight: value }
                        : { typography: { ...elementConfig?.typography, fontWeight: value } };
                      updateElementConfig(updates);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="100">Thin (100)</SelectItem>
                      <SelectItem value="200">Extra Light (200)</SelectItem>
                      <SelectItem value="300">Light (300)</SelectItem>
                      <SelectItem value="400">Regular (400)</SelectItem>
                      <SelectItem value="500">Medium (500)</SelectItem>
                      <SelectItem value="600">Semi Bold (600)</SelectItem>
                      <SelectItem value="700">Bold (700)</SelectItem>
                      <SelectItem value="800">Extra Bold (800)</SelectItem>
                      <SelectItem value="900">Black (900)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Line Height */}
                <div className="space-y-2">
                  <Label>Line Height</Label>
                  <Input
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
                  <Label>Letter Spacing</Label>
                  <Input
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
                {typographyConfig?.textTransform !== undefined && (
                  <div className="space-y-2">
                    <Label>Text Transform</Label>
                    <Select
                      value={typographyConfig.textTransform || 'none'}
                      onValueChange={(value: 'none' | 'uppercase' | 'lowercase' | 'capitalize') => {
                        updateElementConfig({ textTransform: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="uppercase">Uppercase</SelectItem>
                        <SelectItem value="lowercase">Lowercase</SelectItem>
                        <SelectItem value="capitalize">Capitalize</SelectItem>
                      </SelectContent>
                    </Select>
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
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={elementConfig.background && isValidHex(elementConfig.background) ? elementConfig.background : '#000000'}
                      onChange={(e) => updateElementConfig({ background: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={elementConfig.background || ''}
                      onChange={(e) => updateElementConfig({ background: e.target.value })}
                      placeholder="#000000 or transparent"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Text Color */}
                <div className="space-y-2">
                  <Label>Text Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={elementConfig.color && isValidHex(elementConfig.color) ? elementConfig.color : '#FFFFFF'}
                      onChange={(e) => updateElementConfig({ color: e.target.value })}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={elementConfig.color || ''}
                      onChange={(e) => updateElementConfig({ color: e.target.value })}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                  </div>
                </div>

                {/* Gradient */}
                {theme.gradients.length > 0 && (
                  <div className="space-y-2">
                    <Label>Gradient (overrides background)</Label>
                    <Select
                      value={elementConfig.gradient || 'none'}
                      onValueChange={(value) => updateElementConfig({ 
                        gradient: value === 'none' ? undefined : value 
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Gradient</SelectItem>
                        {theme.gradients.map((gradient) => (
                          <SelectItem key={gradient.id} value={gradient.id}>
                            {gradient.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <Separator />

                {/* Border Controls */}
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Border</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Width</Label>
                      <Input
                        type="text"
                        value={elementConfig.border?.width || '1px'}
                        onChange={(e) => updateElementConfig({
                          border: { ...elementConfig.border, width: e.target.value, style: elementConfig.border?.style || 'solid', color: elementConfig.border?.color || '#000000', radius: elementConfig.border?.radius || '4px' }
                        })}
                        placeholder="1px"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Style</Label>
                      <Select
                        value={elementConfig.border?.style || 'solid'}
                        onValueChange={(value: 'solid' | 'dashed' | 'dotted' | 'double' | 'groove' | 'ridge') => 
                          updateElementConfig({
                            border: { ...elementConfig.border, style: value, width: elementConfig.border?.width || '1px', color: elementConfig.border?.color || '#000000', radius: elementConfig.border?.radius || '4px' }
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Solid</SelectItem>
                          <SelectItem value="dashed">Dashed</SelectItem>
                          <SelectItem value="dotted">Dotted</SelectItem>
                          <SelectItem value="double">Double</SelectItem>
                          <SelectItem value="groove">Groove</SelectItem>
                          <SelectItem value="ridge">Ridge</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Color</Label>
                      <div className="flex gap-2">
                        <Input
                          type="color"
                          value={elementConfig.border?.color && isValidHex(elementConfig.border.color) ? elementConfig.border.color : '#000000'}
                          onChange={(e) => updateElementConfig({
                            border: { ...elementConfig.border, color: e.target.value, width: elementConfig.border?.width || '1px', style: elementConfig.border?.style || 'solid', radius: elementConfig.border?.radius || '4px' }
                          })}
                          className="w-12 h-8 p-0"
                        />
                        <Input
                          type="text"
                          value={elementConfig.border?.color || ''}
                          onChange={(e) => updateElementConfig({
                            border: { ...elementConfig.border, color: e.target.value, width: elementConfig.border?.width || '1px', style: elementConfig.border?.style || 'solid', radius: elementConfig.border?.radius || '4px' }
                          })}
                          placeholder="#000000"
                          className="flex-1"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Radius</Label>
                      <Input
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
                  <Label className="text-base font-semibold">Spacing</Label>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Padding</Label>
                      <Input
                        type="text"
                        value={elementConfig.padding || ''}
                        onChange={(e) => updateElementConfig({ padding: e.target.value })}
                        placeholder="1rem"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Margin</Label>
                      <Input
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
                  <Label>Box Shadow</Label>
                  <Input
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