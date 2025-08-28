import React, { useState } from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedInput } from "@/components/ui/themed-input";
import { Badge } from "@/components/ui/badge";
import { EnhancedThemeConfig } from "@/config/enhancedTheme";
import { cn } from "@/lib/utils";

interface EnhancedThemePreviewProps {
  theme: EnhancedThemeConfig;
  selectedElement: string | null;
  onElementSelect: (elementId: string) => void;
}

const EnhancedThemePreview = ({ theme, selectedElement, onElementSelect }: EnhancedThemePreviewProps) => {
  const [inputValue, setInputValue] = useState("Sample input text");

  const getElementStyle = (elementId: string): React.CSSProperties => {
    const isSelected = selectedElement === elementId;
    return {
      outline: isSelected ? '3px solid hsl(var(--theme-accent))' : 'none',
      outlineOffset: isSelected ? '2px' : '0',
      cursor: 'pointer',
      transition: 'outline 0.2s ease-in-out',
    };
  };

  const handleElementClick = (elementId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    onElementSelect(elementId);
  };

  return (
    <ThemedCard className="relative">
      <ThemedCardHeader>
        <ThemedCardTitle>Interactive Theme Preview</ThemedCardTitle>
        <p className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
          Click on any element to customize it individually
        </p>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-8">
        {/* Typography Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Typography</h3>
          <div className="space-y-3">
            <h1 
              className={cn(
                "font-[var(--theme-font-heading)] text-[var(--theme-primary)]",
                "cursor-pointer transition-all duration-200 hover:opacity-80"
              )}
              style={{
                fontSize: theme.typography.h1.fontSize,
                fontWeight: theme.typography.h1.fontWeight,
                lineHeight: theme.typography.h1.lineHeight,
                letterSpacing: theme.typography.h1.letterSpacing,
                textTransform: theme.typography.h1.textTransform,
                ...getElementStyle('typography-h1')
              }}
              onClick={(e) => handleElementClick('typography-h1', e)}
            >
              Main Heading (H1)
            </h1>
            <h2 
              className={cn(
                "font-[var(--theme-font-heading)] text-[var(--theme-text)]",
                "cursor-pointer transition-all duration-200 hover:opacity-80"
              )}
              style={{
                fontSize: theme.typography.h2.fontSize,
                fontWeight: theme.typography.h2.fontWeight,
                lineHeight: theme.typography.h2.lineHeight,
                letterSpacing: theme.typography.h2.letterSpacing,
                textTransform: theme.typography.h2.textTransform,
                ...getElementStyle('typography-h2')
              }}
              onClick={(e) => handleElementClick('typography-h2', e)}
            >
              Secondary Heading (H2)
            </h2>
            <h3
              className={cn(
                "font-[var(--theme-font-heading)] text-[var(--theme-text)]",
                "cursor-pointer transition-all duration-200 hover:opacity-80"
              )}
              style={{
                fontSize: theme.typography.h3.fontSize,
                fontWeight: theme.typography.h3.fontWeight,
                lineHeight: theme.typography.h3.lineHeight,
                ...getElementStyle('typography-h3')
              }}
              onClick={(e) => handleElementClick('typography-h3', e)}
            >
              Section Heading (H3)
            </h3>
            <p 
              className={cn(
                "font-[var(--theme-font-body)] text-[var(--theme-text)]",
                "cursor-pointer transition-all duration-200 hover:opacity-80"
              )}
              style={{
                fontSize: theme.typography.body.fontSize,
                fontWeight: theme.typography.body.fontWeight,
                lineHeight: theme.typography.body.lineHeight,
                ...getElementStyle('typography-body')
              }}
              onClick={(e) => handleElementClick('typography-body', e)}
            >
              Body text using the body font. This is how regular content will appear throughout the application.
            </p>
            <p 
              className={cn(
                "font-[var(--theme-font-display)] text-[var(--theme-primary)]",
                "cursor-pointer transition-all duration-200 hover:opacity-80"
              )}
              style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                ...getElementStyle('typography-display')
              }}
              onClick={(e) => handleElementClick('typography-display', e)}
            >
              Display text for special emphasis and branding.
            </p>
            <code 
              className={cn(
                "font-[var(--theme-font-code)] text-[var(--theme-textMuted)] bg-[var(--theme-surface)] px-2 py-1 rounded",
                "cursor-pointer transition-all duration-200 hover:opacity-80 inline-block"
              )}
              style={{
                fontSize: theme.typography.code.fontSize,
                fontWeight: theme.typography.code.fontWeight,
                lineHeight: theme.typography.code.lineHeight,
                ...getElementStyle('typography-code')
              }}
              onClick={(e) => handleElementClick('typography-code', e)}
            >
              Code font for technical content
            </code>
          </div>
        </div>

        {/* Button Elements */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Button Elements</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.elements.button.default.gradient 
                  ? `var(--theme-gradient-${theme.elements.button.default.gradient})`
                  : theme.elements.button.default.background,
                color: theme.elements.button.default.color,
                border: `${theme.elements.button.default.border?.width} ${theme.elements.button.default.border?.style} ${theme.elements.button.default.border?.color}`,
                borderRadius: theme.elements.button.default.border?.radius,
                padding: theme.elements.button.default.padding,
                fontSize: theme.elements.button.default.typography?.fontSize,
                fontWeight: theme.elements.button.default.typography?.fontWeight,
                lineHeight: theme.elements.button.default.typography?.lineHeight,
                ...getElementStyle('button-default')
              }}
              onClick={(e) => handleElementClick('button-default', e)}
            >
              Primary Button
            </button>
            <button
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.elements.button.secondary.background,
                color: theme.elements.button.secondary.color,
                border: `${theme.elements.button.secondary.border?.width} ${theme.elements.button.secondary.border?.style} ${theme.elements.button.secondary.border?.color}`,
                borderRadius: theme.elements.button.secondary.border?.radius,
                padding: theme.elements.button.secondary.padding,
                fontSize: theme.elements.button.secondary.typography?.fontSize,
                fontWeight: theme.elements.button.secondary.typography?.fontWeight,
                ...getElementStyle('button-secondary')
              }}
              onClick={(e) => handleElementClick('button-secondary', e)}
            >
              Secondary Button
            </button>
            <button
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.elements.button.accent.background,
                color: theme.elements.button.accent.color,
                border: `${theme.elements.button.accent.border?.width} ${theme.elements.button.accent.border?.style} ${theme.elements.button.accent.border?.color}`,
                borderRadius: theme.elements.button.accent.border?.radius,
                padding: theme.elements.button.accent.padding,
                fontSize: theme.elements.button.accent.typography?.fontSize,
                fontWeight: theme.elements.button.accent.typography?.fontWeight,
                ...getElementStyle('button-accent')
              }}
              onClick={(e) => handleElementClick('button-accent', e)}
            >
              Accent Button
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.elements.button.outline.background,
                color: theme.elements.button.outline.color,
                border: `${theme.elements.button.outline.border?.width} ${theme.elements.button.outline.border?.style} ${theme.elements.button.outline.border?.color}`,
                borderRadius: theme.elements.button.outline.border?.radius,
                padding: theme.elements.button.outline.padding,
                fontSize: theme.elements.button.outline.typography?.fontSize,
                fontWeight: theme.elements.button.outline.typography?.fontWeight,
                ...getElementStyle('button-outline')
              }}
              onClick={(e) => handleElementClick('button-outline', e)}
            >
              Outline Button
            </button>
            <button
              className="transition-all duration-200 hover:opacity-90"
              style={{
                background: theme.elements.button.gradient.gradient 
                  ? `var(--theme-gradient-${theme.elements.button.gradient.gradient})`
                  : theme.elements.button.gradient.background,
                color: theme.elements.button.gradient.color,
                border: `${theme.elements.button.gradient.border?.width} ${theme.elements.button.gradient.border?.style} ${theme.elements.button.gradient.border?.color}`,
                borderRadius: theme.elements.button.gradient.border?.radius,
                padding: theme.elements.button.gradient.padding,
                fontSize: theme.elements.button.gradient.typography?.fontSize,
                fontWeight: theme.elements.button.gradient.typography?.fontWeight,
                ...getElementStyle('button-gradient')
              }}
              onClick={(e) => handleElementClick('button-gradient', e)}
            >
              Gradient Button
            </button>
          </div>
        </div>

        {/* Card Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Card Element</h3>
          <div
            className="transition-all duration-200"
            style={{
              background: theme.elements.card.background,
              color: theme.elements.card.color,
              border: `${theme.elements.card.border?.width} ${theme.elements.card.border?.style} ${theme.elements.card.border?.color}`,
              borderRadius: theme.elements.card.border?.radius,
              padding: theme.elements.card.padding,
              boxShadow: theme.elements.card.shadow,
              ...getElementStyle('card')
            }}
            onClick={(e) => handleElementClick('card', e)}
          >
            <h4 className="font-semibold text-lg mb-2">Sample Card</h4>
            <p className="text-sm opacity-90">
              This is a sample card component showing how cards will appear with your theme settings.
            </p>
            <div className="flex gap-2 mt-3">
              <Badge variant="outline" className="text-xs">Tag 1</Badge>
              <Badge variant="outline" className="text-xs">Tag 2</Badge>
            </div>
          </div>
        </div>

        {/* Input Element */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Input Element</h3>
          <ThemedInput
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full transition-all duration-200"
            style={{
              ...getElementStyle('input')
            }}
            onClick={(e) => handleElementClick('input', e)}
            placeholder="Sample input field"
          />
        </div>

        {/* Modal Preview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-[var(--theme-primary)] mb-4">Modal Element</h3>
          <div
            className="transition-all duration-200 max-w-md mx-auto"
            style={{
              background: theme.elements.modal.background,
              color: theme.elements.modal.color,
              border: `${theme.elements.modal.border?.width} ${theme.elements.modal.border?.style} ${theme.elements.modal.border?.color}`,
              borderRadius: theme.elements.modal.border?.radius,
              padding: theme.elements.modal.padding,
              boxShadow: theme.elements.modal.shadow,
              ...getElementStyle('modal')
            }}
            onClick={(e) => handleElementClick('modal', e)}
          >
            <h4 className="font-semibold text-lg mb-2">Sample Modal</h4>
            <p className="text-sm opacity-90 mb-4">
              This preview shows how modals and dialogs will appear with your theme settings.
            </p>
            <div className="flex gap-2 justify-end">
              <button className="px-3 py-1 text-sm rounded bg-opacity-20 bg-gray-500">Cancel</button>
              <button 
                className="px-3 py-1 text-sm rounded"
                style={{ 
                  background: theme.colors.primary,
                  color: theme.colors.background
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default EnhancedThemePreview;