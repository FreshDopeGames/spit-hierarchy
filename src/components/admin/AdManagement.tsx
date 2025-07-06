
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSpeaker } from "lucide-react";
import AdPlacementFormDialog from "./ad/AdPlacementFormDialog";
import AdPlacementListCard from "./ad/AdPlacementListCard";
import { useAdPlacements } from "./ad/useAdPlacements";
import AdminTabHeader from "./AdminTabHeader";
import { AdPlacement, FormData } from "./ad/types";

const AdManagement = () => {
  const { placements, pageTemplates, isLoading, createMutation, updateMutation, deleteMutation } = useAdPlacements();
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);
  const [showForm, setShowForm] = useState(false);

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
    deleteMutation.mutate(id);
  };

  const handleCancel = () => {
    setEditingPlacement(null);
    setShowForm(false);
  };

  const handleNewPlacement = () => {
    setEditingPlacement(null);
    setShowForm(true);
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Advertisement Management" 
        icon={MonitorSpeaker}
        description="Manage ad placements and configurations across the site"
      />

      <Tabs defaultValue="placements" className="space-y-4">
        <TabsList className="bg-[var(--theme-surface)] border border-[var(--theme-border)] w-full grid grid-cols-1 p-2 gap-1 rounded-lg">
          <TabsTrigger
            value="placements"
            className="text-[var(--theme-text)] data-[state=active]:bg-[var(--theme-primary)] data-[state=active]:text-[var(--theme-background)] text-sm px-4 py-2 rounded-md"
          >
            Ad Placements
          </TabsTrigger>
        </TabsList>

        <TabsContent value="placements">
          {showForm ? (
            <AdPlacementFormDialog
              onSubmit={handleSubmit}
              editingPlacement={editingPlacement}
              isLoading={createMutation.isPending || updateMutation.isPending}
              pageTemplates={pageTemplates || []}
              onCancel={handleCancel}
            />
          ) : (
            <>
              <div className="mb-4">
                <button
                  onClick={handleNewPlacement}
                  className="bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
                >
                  Create New Ad Placement
                </button>
              </div>
              <AdPlacementListCard
                placements={placements}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdManagement;
