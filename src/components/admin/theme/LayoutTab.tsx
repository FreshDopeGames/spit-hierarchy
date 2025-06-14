
import React from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeConfig } from "@/config/theme";

interface LayoutTabProps {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
}

const LayoutTab = ({ theme, updateTheme }: LayoutTabProps) => {
  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle>Layout & Spacing</ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-primary)]">Border Radius</h4>
            {Object.entries(theme.borderRadius).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                  {key} Radius
                </Label>
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => updateTheme({
                    borderRadius: { ...theme.borderRadius, [key]: e.target.value }
                  })}
                  className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            ))}
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-[var(--theme-font-heading)] text-[var(--theme-primary)]">Spacing</h4>
            {Object.entries(theme.spacing).map(([key, value]) => (
              <div key={key} className="space-y-2">
                <Label className="text-[var(--theme-text)] font-[var(--theme-font-body)] capitalize">
                  {key} Spacing
                </Label>
                <Input
                  type="text"
                  value={value}
                  onChange={(e) => updateTheme({
                    spacing: { ...theme.spacing, [key]: e.target.value }
                  })}
                  className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)]"
                />
              </div>
            ))}
          </div>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default LayoutTab;
