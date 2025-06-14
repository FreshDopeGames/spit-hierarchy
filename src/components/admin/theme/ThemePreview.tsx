
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { ThemedButton } from "@/components/ui/themed-button";

const ThemePreview = () => {
  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle>Theme Preview</ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <ThemedButton variant="default">Primary Button</ThemedButton>
            <ThemedButton variant="secondary">Secondary Button</ThemedButton>
            <ThemedButton variant="accent">Accent Button</ThemedButton>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ThemedButton variant="outline">Outline Button</ThemedButton>
            <ThemedButton variant="gradient">Gradient Button</ThemedButton>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-[var(--theme-font-heading)] text-[var(--theme-primary)]">
              Heading Text (H1)
            </h1>
            <h2 className="text-2xl font-[var(--theme-font-heading)] text-[var(--theme-text)]">
              Subheading Text (H2)
            </h2>
            <p className="font-[var(--theme-font-body)] text-[var(--theme-text)]">
              Body text using the body font. This is how regular content will appear.
            </p>
            <p className="font-[var(--theme-font-display)] text-[var(--theme-primary)] text-xl">
              Display text for special emphasis and branding.
            </p>
            <code className="font-[var(--theme-font-code)] text-[var(--theme-textMuted)] bg-[var(--theme-surface)] px-2 py-1 rounded">
              Code font for technical content
            </code>
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default ThemePreview;
