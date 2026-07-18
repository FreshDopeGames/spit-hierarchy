import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedTheme } from "@/hooks/useEnhancedTheme";

interface SectionHeader {
  id: string;
  section: string;
  title: string;
  subtitle: string | null;
  background_image_url: string | null;
  is_active: boolean;
}

const RankingsSectionHeader = () => {
  const { theme } = useEnhancedTheme();
  const { data: headerData } = useQuery({
    queryKey: ["section-header", "rankings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("section_headers")
        .select("*")
        .eq("section", "rankings")
        .eq("is_active", true)
        .single();
      if (error) {
        return null;
      }
      return data as SectionHeader;
    }
  });

  const backgroundImage = headerData?.background_image_url;

  return (
    <div className="relative mb-8 sm:mb-4 lg:mb-4 overflow-hidden rounded-2xl">
      {/* Background gradient/image */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-rap-carbon to-rap-burgundy/30"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundBlendMode: "overlay",
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.background} 50%, ${theme.colors.secondary}30)`
        }}
      />

      {/* Content: official logo */}
      <div className="relative z-10 flex items-center justify-center px-6 py-8 sm:py-10 lg:py-12">
        <img
          src="/lovable-uploads/logo-header.png"
          alt="Spit Hierarchy: Goat Rapper Rankings"
          width="480"
          height="96"
          fetchPriority="high"
          loading="eager"
          decoding="sync"
          className="h-[10vh] sm:h-[12vh] lg:h-[15vh] w-auto max-w-full object-contain"
        />
      </div>

      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[var(--theme-surface)] to-transparent" />
    </div>
  );
};

export default RankingsSectionHeader;
