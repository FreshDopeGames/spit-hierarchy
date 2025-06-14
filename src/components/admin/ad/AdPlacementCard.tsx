
import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, Edit3 } from 'lucide-react';

interface AdPlacement {
  id: string;
  page_name: string;
  page_route: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: string;
  is_active: boolean;
}

interface AdPlacementCardProps {
  ad: AdPlacement;
  onEdit: (ad: AdPlacement) => void;
  onDelete: (id: string) => void;
}

const AdPlacementCard = ({ ad, onEdit, onDelete }: AdPlacementCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 bg-rap-carbon/30 rounded-lg">
      <div className="space-y-1">
        <h3 className="text-rap-platinum font-semibold font-mogra">{ad.page_name}</h3>
        <p className="text-rap-smoke text-sm font-merienda">
          {ad.page_route} • {ad.placement_name} • {ad.ad_format}
        </p>
        <p className="text-rap-silver text-sm font-kaushan">
          Ad Unit: {ad.ad_unit_id}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <span className={`px-2 py-1 rounded text-xs font-bold ${
          ad.is_active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {ad.is_active ? 'Active' : 'Inactive'}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(ad)}
          className="text-rap-gold hover:text-rap-gold-light"
        >
          <Edit3 className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(ad.id)}
          className="text-red-400 hover:text-red-300"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdPlacementCard;
