
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette } from "lucide-react";
import { Tables, Database } from "@/integrations/supabase/types";
import StyleSelector from "./image-management/StyleSelector";
import CompletionOverview from "./image-management/CompletionOverview";
import StyleImageCard from "./image-management/StyleImageCard";
import AdminRapperPagination from "./AdminRapperPagination";
import { useImageUpload } from "./image-management/useImageUpload";

type Rapper = Tables<"rappers">;
type ImageStyle = Database["public"]["Enums"]["image_style"];
type RapperImage = Tables<"rapper_images">;

const styleLabels: Record<ImageStyle, string> = {
  photo_real: "Photo Real",
  comic_book: "Comic Book",
  anime: "Anime", 
  video_game: "Video Game",
  hardcore: "Hardcore",
  minimalist: "Minimalist",
  retro: "Retro"
};

const ITEMS_PER_PAGE = 20;

// Helper function to sort styles based on completion stats
const getSortedStyles = (completionStats: Record<ImageStyle, number>) => {
  return Object.entries(styleLabels).sort(([styleA], [styleB]) => {
    const statsA = completionStats[styleA as ImageStyle] || 0;
    const statsB = completionStats[styleB as ImageStyle] || 0;
    
    // If both have images or both have no images, sort alphabetically
    if ((statsA > 0 && statsB > 0) || (statsA === 0 && statsB === 0)) {
      return styleLabels[styleA as ImageStyle].localeCompare(styleLabels[styleB as ImageStyle]);
    }
    
    // Styles with images come first
    return statsB > 0 ? 1 : -1;
  });
};

const RapperImageManagement = () => {
  const [selectedStyle, setSelectedStyle] = useState<ImageStyle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Query for total count of rappers
  const { data: totalCount } = useQuery({
    queryKey: ["admin-rappers-images-count"],
    queryFn: async () => {
      const { count, error } = await supabase
        .from("rappers")
        .select("*", { count: "exact", head: true });
      
      if (error) throw error;
      return count || 0;
    }
  });

  // Query for paginated rappers
  const { data: rappers, isLoading: rappersLoading } = useQuery({
    queryKey: ["admin-rappers-images", currentPage],
    queryFn: async () => {
      const from = (currentPage - 1) * ITEMS_PER_PAGE;
      const to = from + ITEMS_PER_PAGE - 1;
      
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("name", { ascending: true })
        .range(from, to);
      
      if (error) throw error;
      return data;
    }
  });

  const { data: rapperImages, isLoading: imagesLoading } = useQuery({
    queryKey: ["rapper-images"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_images")
        .select("*");
      
      if (error) throw error;
      return data;
    }
  });

  const { uploadingImages, handleFileSelect } = useImageUpload(rappers);

  const getImageForStyle = (rapperId: string, style: ImageStyle): string | null => {
    return rapperImages?.find(img => img.rapper_id === rapperId && img.style === style)?.image_url || null;
  };

  const getCompletionStats = (): Record<ImageStyle, number> => {
    const defaultStats: Record<ImageStyle, number> = {
      photo_real: 0,
      comic_book: 0,
      anime: 0,
      video_game: 0,
      hardcore: 0,
      minimalist: 0,
      retro: 0
    };

    if (!rapperImages) return defaultStats;
    
    const stats: Record<ImageStyle, number> = { ...defaultStats };
    Object.keys(styleLabels).forEach(style => {
      stats[style as ImageStyle] = rapperImages.filter(img => img.style === style).length;
    });
    
    return stats;
  };

  const completionStats = getCompletionStats();
  const sortedStyles = getSortedStyles(completionStats);

  // Set initial selected style to the first in the sorted list
  useEffect(() => {
    if (!selectedStyle && sortedStyles.length > 0 && !rappersLoading && !imagesLoading) {
      setSelectedStyle(sortedStyles[0][0] as ImageStyle);
    }
  }, [selectedStyle, sortedStyles, rappersLoading, imagesLoading]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const totalPages = Math.ceil((totalCount || 0) / ITEMS_PER_PAGE);

  if (rappersLoading || imagesLoading || !selectedStyle) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-[var(--theme-surface)] rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-[var(--theme-surface)] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Style Selector and Stats */}
      <div className="space-y-4">
        <StyleSelector
          selectedStyle={selectedStyle}
          onStyleChange={setSelectedStyle}
          completionStats={completionStats}
          totalRappers={totalCount || 0}
          sortedStyles={sortedStyles}
        />

        {/* Completion Overview */}
        <CompletionOverview completionStats={completionStats} />
      </div>

      {/* Rappers Grid for Selected Style */}
      <Card className="bg-[var(--theme-surface)] border border-[var(--theme-border)]">
        <CardHeader className="pb-4 sm:pb-6">
          <CardTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] flex items-center gap-2 text-lg sm:text-xl">
            <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="break-words">
              {styleLabels[selectedStyle]} Images ({completionStats[selectedStyle] || 0}/{totalCount || 0})
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {rappers?.map((rapper) => (
              <StyleImageCard
                key={`${rapper.id}-${selectedStyle}`}
                rapper={rapper}
                style={selectedStyle}
                imageUrl={getImageForStyle(rapper.id, selectedStyle)}
                isUploading={uploadingImages.has(`${rapper.id}-${selectedStyle}`)}
                onFileSelect={(event) => handleFileSelect(rapper, selectedStyle, event)}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalCount && totalCount > ITEMS_PER_PAGE && (
            <div className="mt-6 sm:mt-8">
              <AdminRapperPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={totalCount}
                itemsPerPage={ITEMS_PER_PAGE}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RapperImageManagement;
