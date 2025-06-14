
import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { Download, Upload, Undo } from "lucide-react";
import { toast } from "sonner";
import { ThemeConfig } from "@/config/theme";

interface ThemeManagementHeaderProps {
  theme: ThemeConfig;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  resetTheme: () => void;
}

const ThemeManagementHeader = ({ theme, updateTheme, resetTheme }: ThemeManagementHeaderProps) => {
  const exportTheme = () => {
    const themeData = JSON.stringify(theme, null, 2);
    const blob = new Blob([themeData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'spit-hierarchy-theme.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Theme exported successfully');
  };

  const importTheme = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedTheme = JSON.parse(e.target?.result as string);
        updateTheme(importedTheme);
        toast.success('Theme imported successfully');
      } catch (error) {
        toast.error('Error importing theme');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <h2 className="text-xl sm:text-2xl font-[var(--theme-font-heading)] text-[var(--theme-primary)] font-mogra">
        Theme Management
      </h2>
      <div className="flex flex-col sm:flex-row gap-2">
        <ThemedButton variant="outline" onClick={exportTheme} className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
          <Download className="w-4 h-4 mr-2" />
          Export
        </ThemedButton>
        <label className="w-full sm:w-auto">
          <ThemedButton variant="outline" asChild className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
            <span>
              <Upload className="w-4 h-4 mr-2" />
              Import
            </span>
          </ThemedButton>
          <input
            type="file"
            accept=".json"
            onChange={importTheme}
            className="hidden"
          />
        </label>
        <ThemedButton variant="destructive" onClick={resetTheme} className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
          <Undo className="w-4 h-4 mr-2" />
          Reset
        </ThemedButton>
      </div>
    </div>
  );
};

export default ThemeManagementHeader;
