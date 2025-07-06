import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MonitorSpeaker } from "lucide-react";
import AdPlacementFormDialog from "./ad/AdPlacementFormDialog";
import AdPlacementListCard from "./ad/AdPlacementListCard";
import { useAdPlacements } from "./ad/useAdPlacements";
import AdminTabHeader from "./AdminTabHeader";

const AdManagement = () => {
  const { placements, isLoading, deletePlacement, updatePlacement } = useAdPlacements();

  return (
    <div className="space-y-6">
      <AdminTabHeader 
        title="Advertisement Management" 
        icon={MonitorSpeaker}
        description="Manage ad placements and configurations across the site"
      >
        <AdPlacementFormDialog />
      </AdminTabHeader>

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
          <AdPlacementListCard
            placements={placements}
            isLoading={isLoading}
            deletePlacement={deletePlacement}
            updatePlacement={updatePlacement}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdManagement;
