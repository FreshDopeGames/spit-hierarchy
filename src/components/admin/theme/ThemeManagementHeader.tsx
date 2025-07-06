
import React from "react";
import { ThemedButton } from "@/components/ui/themed-button";
import { Download, Upload, Undo, Save, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { ThemeConfig } from "@/config/theme";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ThemeManagementHeaderProps {
  theme: ThemeConfig;
  previewTheme: ThemeConfig | null;
  isPreviewMode: boolean;
  hasUnsavedChanges: boolean;
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  applyTheme: () => void;
  resetTheme: () => void;
  enterPreviewMode: () => void;
  exitPreviewMode: () => void;
}

const ThemeManagementHeader = ({ 
  theme, 
  previewTheme,
  isPreviewMode,
  hasUnsavedChanges,
  updateTheme, 
  applyTheme,
  resetTheme,
  enterPreviewMode,
  exitPreviewMode
}: ThemeManagementHeaderProps) => {
  const exportTheme = () => {
    const themeData = JSON.stringify(previewTheme || theme, null, 2);
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

  const handleReset = () => {
    if (hasUnsavedChanges) {
      if (confirm('You have unsaved changes. Are you sure you want to reset the theme?')) {
        resetTheme();
        toast.success('Theme reset to default');
      }
    } else {
      resetTheme();
      toast.success('Theme reset to default');
    }
  };

  const handleApplyTheme = () => {
    applyTheme();
    toast.success('Theme applied successfully');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h2 className="text-xl sm:text-2xl font-[var(--theme-font-heading)] text-[var(--theme-primary)] font-mogra">
          Theme Management
        </h2>
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Preview Mode Toggle */}
          <ThemedButton 
            variant="outline" 
            onClick={isPreviewMode ? exitPreviewMode : enterPreviewMode}
            className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto"
          >
            {isPreviewMode ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
            {isPreviewMode ? "Exit Preview" : "Preview Mode"}
          </ThemedButton>

          {/* Apply Changes Button */}
          <ThemedButton 
            onClick={handleApplyTheme}
            disabled={!hasUnsavedChanges}
            className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            Apply Changes
          </ThemedButton>

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
          <ThemedButton variant="destructive" onClick={handleReset} className="w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto">
            <Undo className="w-4 h-4 mr-2" />
            Reset
          </ThemedButton>
        </div>
      </div>

      {/* Preview Mode Alert */}
      {isPreviewMode && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertTriangle className="h-4 w-4 text-yellow-500" />
          <AlertDescription className="text-[var(--theme-text)]">
            Preview Mode: Changes are temporary and won't affect the live site until you click "Apply Changes".
            {hasUnsavedChanges && " You have unsaved changes."}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ThemeManagementHeader;
