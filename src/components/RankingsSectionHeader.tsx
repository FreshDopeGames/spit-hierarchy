
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Crown, TrendingUp } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface SectionHeader {
  id: string;
  section_name: string;
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
      } = await supabase.from("section_headers").select("*").eq("section_name", "rankings").eq("is_active", true).single();
      if (error) {
        console.log("No custom header found, using default");
        return null;
      }
      return data as SectionHeader;
    }
  });

  const title = headerData?.title || "The Original Rap GOAT Hierarchy";
  const subtitle = headerData?.subtitle || "Discover the greatest rappers of all time, rising legends, and lyrical masters";
  const backgroundImage = headerData?.background_image_url;

  return (
    <div className="relative mb-12 overflow-hidden rounded-2xl">
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
      <div className="absolute inset-0 bg-gradient-to-r from-rap-carbon/80 via-rap-carbon/60 to-rap-carbon/80" />
      
      {/* Content */}
      <div className="relative z-10 px-6 text-center py-[30px] sm:py-10 lg:py-5 sm:scale-50 lg:scale-50 transform origin-top">
        <div className="max-w-4xl mx-auto">
          {/* Icon and Title */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <Crown 
              className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" 
              style={{ color: theme.colors.primary }}
            />
            <h1 
              className="text-4xl sm:text-5xl font-ceviche animate-text-glow tracking-wider font-normal lg:text-6xl"
              style={{ color: theme.colors.primary }}
            >
              {title}
            </h1>
            <TrendingUp 
              className="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" 
              style={{ color: theme.colors.primary }}
            />
          </div>
          
          {/* Subtitle */}
          <p className="text-lg sm:text-xl lg:text-2xl text-rap-platinum font-kaushan max-w-3xl mx-auto leading-relaxed">
            {subtitle}
          </p>
          
          {/* Decorative Elements */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <div 
              className="h-px w-20"
              style={{ 
                background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`
              }}
            />
            <Crown 
              className="w-5 h-5" 
              style={{ color: theme.colors.primary }}
            />
            <div 
              className="h-px w-20"
              style={{ 
                background: `linear-gradient(to right, transparent, ${theme.colors.primary}, transparent)`
              }}
            />
          </div>
        </div>
      </div>
      
      {/* Bottom fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-rap-carbon to-transparent" />
    </div>
  );
};

export default RankingsSectionHeader;
