import React, { useEffect, useState, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

interface RapperTile {
  id: string;
  name: string;
  image_url: string | null;
}

const TILE_COUNT = 5;
const ROTATION_INTERVAL_MS = 2500;

const RotatingRapperMosaic: React.FC = () => {
  const { data: pool = [] } = useQuery({
    queryKey: ["quiz-mosaic-rappers"],
    queryFn: async (): Promise<RapperTile[]> => {
      const { data, error } = await supabase
        .from("rappers")
        .select("id, name, image_url")
        .not("image_url", "is", null)
        .order("total_votes", { ascending: false })
        .limit(40);

      if (error) {
        console.error("[RotatingRapperMosaic] fetch error:", error);
        return [];
      }
      return (data || []).filter((r) => r.image_url && r.image_url.trim() !== "");
    },
    staleTime: 30 * 60 * 1000,
  });

  const [tiles, setTiles] = useState<RapperTile[]>([]);
  const rotationIndexRef = useRef(0);

  // Initialize tiles when pool loads
  useEffect(() => {
    if (pool.length === 0) return;
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    setTiles(shuffled.slice(0, TILE_COUNT));
  }, [pool]);

  // Rotate one tile at a time
  useEffect(() => {
    if (pool.length <= TILE_COUNT) return;

    const interval = setInterval(() => {
      if (document.visibilityState !== "visible") return;

      setTiles((current) => {
        if (current.length < TILE_COUNT) return current;
        const currentIds = new Set(current.map((t) => t.id));
        const candidates = pool.filter((r) => !currentIds.has(r.id));
        if (candidates.length === 0) return current;

        const next = candidates[Math.floor(Math.random() * candidates.length)];
        const idx = rotationIndexRef.current % TILE_COUNT;
        rotationIndexRef.current += 1;

        const updated = [...current];
        updated[idx] = next;
        return updated;
      });
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pool]);

  // Render placeholders while loading
  const displayTiles: (RapperTile | null)[] =
    tiles.length === TILE_COUNT
      ? tiles
      : Array.from({ length: TILE_COUNT }).map(() => null);

  return (
    <div className="grid grid-cols-5 gap-1 max-w-md mx-auto rounded-md overflow-hidden">
      {displayTiles.map((tile, i) => (
        <div
          key={`tile-${i}`}
          className="relative aspect-square overflow-hidden border-[2px] border-[hsl(var(--theme-background))] bg-[hsl(var(--theme-surfaceSecondary))] rounded-sm"
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={tile?.id || `empty-${i}`}
              src={tile?.image_url || getOptimizedPlaceholder("thumb")}
              alt={tile?.name || "Rapper"}
              loading="lazy"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = getOptimizedPlaceholder("thumb");
              }}
            />
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};

export default RotatingRapperMosaic;
