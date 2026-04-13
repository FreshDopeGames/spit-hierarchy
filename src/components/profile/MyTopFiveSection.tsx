import React, { useState } from "react";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";
import { useUserProfile } from "@/hooks/useUserProfile";
import TopFiveSlot from "./TopFiveSlot";
import RapperSearchOverlay from "./RapperSearchOverlay";
import ShareTopFiveModal from "./ShareTopFiveModal";
import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
} from "@dnd-kit/sortable";
import { Music } from "lucide-react";

const MyTopFiveSection = () => {
  const {
    topRappers,
    isLoading,
    updateTopRapper,
    swapPositions,
    selectedRapperIds,
    isUpdating,
  } = useUserTopRappers();
  const { userProfile } = useUserProfile();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [activeId, setActiveId] = useState<number | null>(null);

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(pointerSensor, touchSensor);

  const handleSlotClick = (position: number) => {
    setSelectedPosition(position);
    setIsSearchOpen(true);
  };

  const handleRapperSelect = (rapperId: string, rapperData?: { id: string; name: string; image_url: string | null; slug: string }) => {
    if (selectedPosition !== null) {
      updateTopRapper({ position: selectedPosition, rapperId, rapperData });
      setIsSearchOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSelectedPosition(null);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (isUpdating) return;
    setActiveId(event.active.id as number);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);

    if (isUpdating) return;

    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const posA = active.id as number;
    const posB = over.id as number;

    const hasA = topRappers.some(item => item.position === posA);
    const hasB = topRappers.some(item => item.position === posB);

    if (hasA && hasB) {
      swapPositions({ posA, posB });
    }
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Create array of 5 positions with current data
  const slots = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null
    };
  });

  const sortableIds = slots.map(s => s.position);
  const activeSlot = activeId ? slots.find(s => s.position === activeId) : null;

  if (isLoading) {
    return (
      <div className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
        <div className="animate-pulse">
          <div className="h-6 rounded mb-4 w-32 mx-auto bg-rap-carbon/30"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-24 rounded bg-rap-carbon/30"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div id="my-top-5" className="bg-black border-4 border-[hsl(var(--theme-primary))] rounded-lg p-4 sm:p-6 mb-6 sm:mb-8 shadow-lg shadow-[hsl(var(--theme-primary))]/20">
        <div className="relative mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)] text-center">
            My Top 5
          </h3>
          <Button
            onClick={() => setIsShareOpen(true)}
            variant="outline"
            size="sm"
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-2 border-[hsl(var(--theme-primary))]/30 text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))] hover:text-black"
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <SortableContext items={sortableIds} strategy={rectSortingStrategy}>
            {/* 
              Single grid for all 5 slots. 
              Mobile: 1 col, Tablet: 2 col (pos 1 spans full), Desktop: 6-col grid with custom spans.
            */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
              {slots.map(slot => (
                <div
                  key={slot.position}
                  className={
                    slot.position <= 2
                      ? "sm:col-span-1 lg:col-span-3" + (slot.position === 1 ? " sm:col-span-2 lg:col-span-3" : "")
                      : "sm:col-span-1 lg:col-span-2"
                  }
                >
                  <TopFiveSlot
                    position={slot.position}
                    rapper={slot.rapper}
                    onEditClick={() => handleSlotClick(slot.position)}
                    disabled={isUpdating}
                  />
                </div>
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={null}>
            {activeSlot ? (
              <div className="border-2 border-[hsl(var(--theme-primary))] rounded-lg p-3 bg-[hsl(var(--theme-surfaceSecondary))] shadow-2xl shadow-[hsl(var(--theme-primary))]/40 opacity-90 rotate-2 scale-105">
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-full max-w-60 h-32 sm:h-40 rounded-lg overflow-hidden border border-[hsl(var(--theme-primary))]/20 bg-[hsl(var(--theme-surface))]">
                    {activeSlot.rapper?.image_url ? (
                      <img
                        src={activeSlot.rapper.image_url}
                        alt={activeSlot.rapper.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music className="w-12 h-12" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                      </div>
                    )}
                  </div>
                  <div
                    className="text-sm sm:text-lg font-bold text-center"
                    style={{ color: 'hsl(var(--theme-text))', fontFamily: 'var(--theme-font-body)' }}
                  >
                    {activeSlot.rapper?.name}
                  </div>
                </div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      <RapperSearchOverlay
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectRapper={handleRapperSelect}
        excludeIds={selectedRapperIds}
        position={selectedPosition || 1}
      />

      <ShareTopFiveModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        slots={slots}
        username={userProfile?.username || "Anonymous"}
      />
    </>
  );
};

export default MyTopFiveSection;
