
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AdPlacementForm from "./AdPlacementForm";
import { AdPlacement, PageTemplate, FormData } from "./types";

interface AdPlacementFormDialogProps {
  onSubmit: (data: FormData) => void;
  editingPlacement: AdPlacement | null;
  isLoading: boolean;
  pageTemplates: PageTemplate[];
  onCancel: () => void;
}

const AdPlacementFormDialog = ({ 
  onSubmit, 
  editingPlacement, 
  isLoading, 
  pageTemplates, 
  onCancel 
}: AdPlacementFormDialogProps) => {
  return (
    <Card className="bg-carbon-fiber border-rap-gold/30">
      <CardHeader>
        <CardTitle className="text-rap-gold">
          {editingPlacement ? "Edit Ad Placement" : "Create New Ad Placement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AdPlacementForm
          onSubmit={onSubmit}
          initialData={editingPlacement}
          isLoading={isLoading}
          pageTemplates={pageTemplates}
        />
        <div className="flex gap-2 mt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold hover:text-rap-carbon"
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdPlacementFormDialog;
