
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, TrendingUp } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface SectionHeader {
  id: string;
  section: string;
  title: string;
  subtitle: string | null;
  background_image_url: string | null;
  is_active: boolean;
}

const RankingsSectionHeader = () => {
  const { theme } = useTheme();
  
  const {
    data: headerData
  } = useQuery({
    queryKey: ["section-header", "rankings"],
    queryFn: async () => {
      const {
        data,
        error
      } = await supabase.from("section_headers").select("*").eq("section", "rankings").eq("is_active", true).single();
      if (error) {
        console.log("No custom header found, using default");
        return null;
      }
      return data as SectionHeader;
    }
  });

  const title = headerData?.title || "SPIT HIERARCHY: The Original Rap GOAT Rankings";
  const subtitle = headerData?.subtitle || "Discover the greatest rappers of all time, rising legends, and lyrical masters";
  const backgroundImage = headerData?.background_image_url;

  return (
    <div className="relative mb-12 sm:mb-6 lg:mb-6 overflow-hidden rounded-2xl">
      {/* Background Image Container */}
      <div 
        className="absolute inset-0 bg-gradient-to-br from-rap-carbon to-rap-burgundy/30" 
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundBlendMode: 'overlay',
          background: `linear-gradient(135deg, ${theme.colors.primary}20, ${theme.colors.backgroundLight} 50%, ${theme.colors.secondary}30)`
        }}
      />
      
      {/* Overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--theme-surface)]/80 via-[var(--theme-surface)]/60 to-[var(--theme-surface)]/80" />
      
      {/* Content */}
      <div className="relative z-10 px-6 text-center py-[30px] sm:py-6 lg:py-4">
        <div className="max-w-4xl mx-auto">
          {/* Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-6 sm:gap-2 sm:mb-3 lg:mb-2">
            <Crown 
              className="w-10 h-10 sm:w-6 sm:h-6 lg:w-5 lg:h-5 animate-pulse" 
              style={{ color: theme.colors.primary }}
            />
            <h1 
              className="text-4xl sm:text-3xl lg:text-4xl font-ceviche animate-text-glow tracking-wider font-normal"
              style={{ color: theme.colors.primary }}
            >
              {title}
            </h1>
            <TrendingUp 
              className="w-10 h-10 sm:w-6 sm:h-6 lg:w-5 lg:h-5 animate-pulse" 
              style={{ color: theme.colors.primary }}
            />
          </div>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-base lg:text-lg text-[var(--theme-text)] font-[var(--theme-font-body)] max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-8 sm:mt-4 lg:mt-4 flex items-center justify-center gap-2 sm:gap-1 lg:gap-1">
            <div 
              className="h-px w-20 sm:w-10 lg:w-10"
              style={{ 
                background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`
              }}
            />
            <Crown 
              className="w-5 h-5 sm:w-4 sm:h-4 lg:w-3 lg:h-3" 
              style={{ color: theme.colors.primary }}
            />
            <div 
              className="h-px w-20 sm:w-10 lg:w-10"
              style={{ 
                background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-[var(--theme-surface)] to-transparent" />
    </div>
  );
};

export default RankingsSectionHeader;
