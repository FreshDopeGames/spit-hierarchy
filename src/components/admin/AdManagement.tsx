
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useAdPlacements } from "./ad/useAdPlacements";
import AdPlacementFormDialog from "./ad/AdPlacementFormDialog";
import AdPlacementListCard from "./ad/AdPlacementListCard";
import { AdPlacement, FormData } from "./ad/types";

const AdManagement = () => {
  const [showForm, setShowForm] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  
  const {
    placements,
    pageTemplates,
    isLoading,
    createMutation,
    updateMutation,
    deleteMutation
  } = useAdPlacements();

  const handleSubmit = (data: FormData) => {
    if (editingPlacement) {
      updateMutation.mutate({ ...data, id: editingPlacement.id }, {
        onSuccess: () => {
          setEditingPlacement(null);
          setShowForm(false);
        }
      });
    } else {
      createMutation.mutate(data, {
        onSuccess: () => {
          setShowForm(false);
        }
      });
    }
  };

  const handleEdit = (placement: AdPlacement) => {
    setEditingPlacement(placement);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this ad placement?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPlacement(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-rap-gold">Ad Management</h2>
        <Button 
          onClick={() => setShowForm(true)}
          className="bg-rap-gold text-rap-carbon hover:bg-rap-gold/80"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Placement
        </Button>
      </div>

      {showForm && (
        <AdPlacementFormDialog
          onSubmit={handleSubmit}
          editingPlacement={editingPlacement}
          isLoading={createMutation.isPending || updateMutation.isPending}
          pageTemplates={pageTemplates || []}
          onCancel={handleCancel}
        />
      )}

      <AdPlacementListCard
        placements={placements}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AdManagement;
