
import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Table as TableIcon } from "lucide-react";

interface AchievementViewModeSelectorProps {
  viewMode: 'cards' | 'table';
  onViewModeChange: (mode: 'cards' | 'table') => void;
}

const AchievementViewModeSelector = ({ viewMode, onViewModeChange }: AchievementViewModeSelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant={viewMode === 'table' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className={viewMode === 'table' 
          ? "bg-rap-gold text-rap-carbon hover:bg-rap-gold/80" 
          : "border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
        }
      >
        <TableIcon className="w-4 h-4 mr-1" />
        Table
      </Button>
      <Button
        variant={viewMode === 'cards' ? 'default' : 'outline'}
        size="sm"
        onClick={() => onViewModeChange('cards')}
        className={viewMode === 'cards' 
          ? "bg-rap-gold text-rap-carbon hover:bg-rap-gold/80" 
          : "border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
        }
      >
        <LayoutGrid className="w-4 h-4 mr-1" />
        Cards
      </Button>
    </div>
  );
};

export default AchievementViewModeSelector;
