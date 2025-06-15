
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { AdPlacement } from "./types";

interface AdPlacementListCardProps {
  placements: AdPlacement[] | undefined;
  isLoading: boolean;
  onEdit: (placement: AdPlacement) => void;
  onDelete: (id: string) => void;
}

const AdPlacementListCard = ({ 
  placements, 
  isLoading, 
  onEdit, 
  onDelete 
}: AdPlacementListCardProps) => {
  return (
    <Card className="bg-carbon-fiber border-rap-gold/30">
      <CardHeader>
        <CardTitle className="text-rap-gold">Ad Placements</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-rap-carbon/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {placements && placements.length > 0 ? (
              placements.map((placement) => (
                <div key={placement.id} className="flex items-center justify-between p-4 bg-rap-carbon/20 rounded-lg border border-rap-gold/20">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white">{placement.placement_name}</h3>
                    <p className="text-gray-400 text-sm">{placement.page_name} ({placement.page_route})</p>
                    <p className="text-gray-500 text-xs">Format: {placement.ad_format} | Unit ID: {placement.ad_unit_id}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(placement)}
                      className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(placement.id)}
                      className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No ad placements found</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AdPlacementListCard;
