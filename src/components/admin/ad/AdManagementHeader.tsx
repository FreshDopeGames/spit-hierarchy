
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AdManagementHeaderProps {
  onAddClick: () => void;
}

const AdManagementHeader = ({ onAddClick }: AdManagementHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
      <h2 className="text-xl sm:text-2xl font-bold text-rap-platinum font-mogra">Ad Management</h2>
      <Button 
        onClick={onAddClick}
        className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra w-full sm:w-auto text-sm sm:text-base px-3 sm:px-4 py-2 h-10 sm:h-auto"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Ad Placement
      </Button>
    </div>
  );
};

export default AdManagementHeader;
