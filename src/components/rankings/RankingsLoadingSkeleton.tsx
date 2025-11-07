import { ThemedSkeleton } from "@/components/ui/themed-skeleton";

const RankingsLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="flex flex-col min-h-[420px] sm:min-h-[650px] md:min-h-[500px]"
          style={{
            borderRadius: "var(--theme-element-ranking_card-border-radius, 12px)",
            border: `var(--theme-element-ranking_card-border-width, 4px) var(--theme-element-ranking_card-border-style, solid) hsl(var(--theme-primary))`,
            backgroundColor: "var(--theme-element-ranking_card-bg, #1A1A1A)",
            boxShadow: "var(--theme-element-ranking_card-shadow, 0 4px 6px rgba(0, 0, 0, 0.2))",
          }}
        >
          {/* Mosaic Section Skeleton */}
          <div className="relative overflow-hidden">
            <div className="flex flex-col gap-0">
              {/* Top Row - 2 Images */}
              <div className="grid grid-cols-2">
                {Array.from({ length: 2 }).map((_, imgIndex) => (
                  <div
                    key={`top-${imgIndex}`}
                    className="relative aspect-[4/3] w-full overflow-hidden"
                    style={{
                      border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`,
                    }}
                  >
                    <ThemedSkeleton className="w-full h-full" />
                  </div>
                ))}
              </div>

              {/* Bottom Row - 3 Images */}
              <div className="grid grid-cols-3">
                {Array.from({ length: 3 }).map((_, imgIndex) => (
                  <div
                    key={`bottom-${imgIndex}`}
                    className="relative aspect-[4/3] w-full overflow-hidden"
                    style={{
                      border: `var(--theme-element-ranking_card_avatar_border-border-width, 3px) var(--theme-element-ranking_card_avatar_border-border-style, solid) var(--theme-element-ranking_card_avatar_border-border-color, #000000)`,
                    }}
                  >
                    <ThemedSkeleton className="w-full h-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Metadata Section Skeleton */}
          <div
            className="flex-1 flex flex-col justify-between p-3 sm:p-6 pb-3 sm:pb-4"
            style={{
              background: "linear-gradient(to bottom, #404040 0%, #000000 100%)",
            }}
          >
            {/* Top content group */}
            <div className="flex flex-col min-h-0">
              {/* Category Badge Skeleton */}
              <div className="mb-0.5 sm:mb-1">
                <ThemedSkeleton className="h-6 w-24 rounded-full" />
              </div>

              {/* Title Skeleton - 2 lines */}
              <div className="mb-1 sm:mb-2 space-y-2">
                <ThemedSkeleton className="h-6 sm:h-8 w-full" />
                <ThemedSkeleton className="h-6 sm:h-8 w-3/4" />
              </div>

              {/* Description Skeleton - 2 lines */}
              <div className="mb-2 sm:mb-3 space-y-2">
                <ThemedSkeleton className="h-4 w-full" />
                <ThemedSkeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Stats Row Skeleton - Pinned to bottom */}
            <div className="flex items-center justify-between mt-3 sm:mt-4">
              <ThemedSkeleton className="h-5 w-24" />
              <ThemedSkeleton className="h-5 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RankingsLoadingSkeleton;
