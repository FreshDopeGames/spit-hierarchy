import React, { useState } from "react";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Plus, Trash2 } from "lucide-react";
import { GradientConfig, gradientToCSS, defaultEnhancedTheme } from "@/config/enhancedTheme";

interface GradientBuilderProps {
  gradients: GradientConfig[];
  onGradientChange: (gradients: GradientConfig[]) => void;
  selectedGradient: string | null;
  onSelectGradient: (gradientId: string) => void;
}

const GradientBuilder = ({ gradients, onGradientChange, selectedGradient, onSelectGradient }: GradientBuilderProps) => {
  const [editingGradient, setEditingGradient] = useState<GradientConfig | null>(null);

  const handleCreateGradient = () => {
    const newGradient: GradientConfig = {
      id: `gradient-${Date.now()}`,
      name: 'New Gradient',
      type: 'linear',
      direction: 45,
      stops: [
        { color: defaultEnhancedTheme.colors.background, position: 0 },
        { color: defaultEnhancedTheme.colors.primary, position: 100 }
      ]
    };
    
    setEditingGradient(newGradient);
    onGradientChange([...gradients, newGradient]);
  };

  const handleUpdateGradient = (updatedGradient: GradientConfig) => {
    const updatedGradients = gradients.map(g => 
      g.id === updatedGradient.id ? updatedGradient : g
    );
    onGradientChange(updatedGradients);
    setEditingGradient(updatedGradient);
  };

  const handleDeleteGradient = (gradientId: string) => {
    const updatedGradients = gradients.filter(g => g.id !== gradientId);
    onGradientChange(updatedGradients);
    if (editingGradient?.id === gradientId) {
      setEditingGradient(null);
    }
  };

  const handleAddStop = (gradient: GradientConfig) => {
    const newStop = {
      color: defaultEnhancedTheme.colors.surface,
      position: 50
    };
    
    const updatedGradient = {
      ...gradient,
      stops: [...gradient.stops, newStop].sort((a, b) => a.position - b.position)
    };
    
    handleUpdateGradient(updatedGradient);
  };

  const handleRemoveStop = (gradient: GradientConfig, stopIndex: number) => {
    if (gradient.stops.length <= 2) return; // Keep at least 2 stops
    
    const updatedGradient = {
      ...gradient,
      stops: gradient.stops.filter((_, index) => index !== stopIndex)
    };
    
    handleUpdateGradient(updatedGradient);
  };

  const handleStopChange = (gradient: GradientConfig, stopIndex: number, property: string, value: string | number) => {
    const updatedStops = gradient.stops.map((stop, index) => 
      index === stopIndex ? { ...stop, [property]: value } : stop
    ).sort((a, b) => a.position - b.position);
    
    const updatedGradient = {
      ...gradient,
      stops: updatedStops
    };
    
    handleUpdateGradient(updatedGradient);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Gradient List */}
      <ThemedCard>
        <ThemedCardHeader>
          <ThemedCardTitle>Gradients</ThemedCardTitle>
          <Button onClick={handleCreateGradient} size="sm" className="ml-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Gradient
          </Button>
        </ThemedCardHeader>
        <ThemedCardContent className="space-y-3">
          {gradients.map((gradient) => (
            <div key={gradient.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <button
                  className={`flex-1 p-3 rounded border text-left transition-colors ${
                    selectedGradient === gradient.id 
                      ? 'border-[var(--theme-primary)] bg-[var(--theme-primary)]/10' 
                      : 'border-[var(--theme-border)] hover:bg-[var(--theme-surface)]'
                  }`}
                  onClick={() => {
                    onSelectGradient(gradient.id);
                    setEditingGradient(gradient);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded border border-[var(--theme-border)]"
                      style={{ background: gradientToCSS(gradient) }}
                    />
                    <div>
                      <div className="font-medium text-[var(--theme-text)]">{gradient.name}</div>
                      <div className="text-xs text-[var(--theme-textMuted)] capitalize">
                        {gradient.type} • {gradient.stops.length} stops
                      </div>
                    </div>
                  </div>
                </button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDeleteGradient(gradient.id)}
                  className="ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </ThemedCardContent>
      </ThemedCard>

      {/* Gradient Editor */}
      {editingGradient && (
        <ThemedCard>
          <ThemedCardHeader>
            <ThemedCardTitle>Edit Gradient</ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent className="space-y-6">
            {/* Preview */}
            <div className="space-y-2">
              <Label>Preview</Label>
              <div 
                className="w-full h-16 rounded border border-[var(--theme-border)]"
                style={{ background: gradientToCSS(editingGradient) }}
              />
            </div>

            {/* Basic Properties */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={editingGradient.name}
                  onChange={(e) => handleUpdateGradient({
                    ...editingGradient,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label>Type</Label>
                <Select
                  value={editingGradient.type}
                  onValueChange={(value: 'linear' | 'radial' | 'conic') => 
                    handleUpdateGradient({
                      ...editingGradient,
                      type: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="linear">Linear</SelectItem>
                    <SelectItem value="radial">Radial</SelectItem>
                    <SelectItem value="conic">Conic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Direction (for linear and conic) */}
            {(editingGradient.type === 'linear' || editingGradient.type === 'conic') && (
              <div className="space-y-2">
                <Label>Direction: {editingGradient.direction}°</Label>
                <Slider
                  value={[editingGradient.direction]}
                  onValueChange={([value]) => handleUpdateGradient({
                    ...editingGradient,
                    direction: value
                  })}
                  max={360}
                  min={0}
                  step={1}
                  className="w-full"
                />
              </div>
            )}

            {/* Color Stops */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Color Stops</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddStop(editingGradient)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Stop
                </Button>
              </div>
              
              <div className="space-y-3">
                {editingGradient.stops.map((stop, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border border-[var(--theme-border)] rounded">
                     <div className="flex items-center gap-2 flex-1">
                       <Select
                         value={stop.color}
                         onValueChange={(value) => handleStopChange(editingGradient, index, 'color', value)}
                       >
                         <SelectTrigger className="flex-1">
                           <SelectValue>
                             <div className="flex items-center gap-2">
                               <div 
                                 className="w-4 h-4 rounded border border-[var(--theme-border)]"
                                 style={{ backgroundColor: stop.color }}
                               />
                               <span className="capitalize">
                                 {Object.entries(defaultEnhancedTheme.colors).find(([_, color]) => color === stop.color)?.[0] || 'Custom'}
                               </span>
                             </div>
                           </SelectValue>
                         </SelectTrigger>
                         <SelectContent>
                           {Object.entries(defaultEnhancedTheme.colors).map(([colorName, colorValue]) => (
                             <SelectItem key={colorName} value={colorValue}>
                               <div className="flex items-center gap-2">
                                 <div 
                                   className="w-4 h-4 rounded border border-[var(--theme-border)]"
                                   style={{ backgroundColor: colorValue }}
                                 />
                                 <span className="capitalize">{colorName.replace(/([A-Z])/g, ' $1').trim()}</span>
                               </div>
                             </SelectItem>
                           ))}
                         </SelectContent>
                       </Select>
                     </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs whitespace-nowrap">Position:</Label>
                      <Input
                        type="number"
                        value={stop.position}
                        onChange={(e) => handleStopChange(editingGradient, index, 'position', parseInt(e.target.value) || 0)}
                        className="w-20"
                        min={0}
                        max={100}
                      />
                      <span className="text-xs text-[var(--theme-textMuted)]">%</span>
                    </div>
                    {editingGradient.stops.length > 2 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveStop(editingGradient, index)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CSS Output */}
            <div className="space-y-2">
              <Label>CSS Output</Label>
              <div className="p-3 bg-[var(--theme-surface)] border border-[var(--theme-border)] rounded font-mono text-sm">
                {gradientToCSS(editingGradient)}
              </div>
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}
    </div>
  );
};

export default GradientBuilder;