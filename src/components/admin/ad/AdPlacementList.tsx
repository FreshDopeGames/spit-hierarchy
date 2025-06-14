
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import AdPlacementCard from './AdPlacementCard';

interface AdPlacement {
  id: string;
  page_name: string;
  page_route: string;
  placement_name: string;
  ad_unit_id: string;
  ad_format: string;
  is_active: boolean;
}

interface AdPlacementListProps {
  adPlacements: AdPlacement[] | undefined;
  isLoading: boolean;
  onEdit: (ad: AdPlacement) => void;
  onDelete: (id: string) => void;
  onShowForm: () => void;
}

const AdPlacementList = ({ 
  adPlacements, 
  isLoading, 
  onEdit, 
  onDelete, 
  onShowForm 
}: AdPlacementListProps) => {
  return (
    <Card className="bg-carbon-fiber border-rap-silver/40">
      <CardHeader>
        <CardTitle className="text-rap-silver font-mogra">Current Ad Placements</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-rap-platinum">Loading...</div>
        ) : adPlacements && adPlacements.length > 0 ? (
          <div className="space-y-4">
            {adPlacements.map((ad) => (
              <AdPlacementCard
                key={ad.id}
                ad={ad}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-rap-smoke font-merienda">No ad placements configured yet.</p>
            <Button 
              onClick={onShowForm}
              className="mt-4 bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra"
            >
              Create Your First Ad Placement
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdPlacementList;
