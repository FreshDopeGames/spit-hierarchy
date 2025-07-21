
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";

type Rapper = Tables<"rappers">;

interface RapperAvatarProps {
  rapper: Rapper;
  size?: "sm" | "md" | "lg" | "xl";
  imageUrl?: string | null; // Allow passing image URL directly for batch loading
}

const RapperAvatar = ({ rapper, size = "md", imageUrl: providedImageUrl }: RapperAvatarProps) => {
  // Map avatar sizes to image sizes
  const imageSizeMap = {
    sm: 'thumb' as const,
    md: 'medium' as const,
    lg: 'large' as const,
    xl: 'xlarge' as const
  };
  
  const { data: fetchedImageUrl } = useRapperImage(rapper.id, imageSizeMap[size]);
  
  // Use provided imageUrl if available (from batch loading), otherwise use fetched URL
  const imageUrl = providedImageUrl !== undefined ? providedImageUrl : fetchedImageUrl;
  
  const sizeClasses = {
    sm: "w-12 h-12 sm:w-14 sm:h-14",
    md: "w-16 h-16 sm:w-18 sm:h-18",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
    xl: "w-24 h-24 sm:w-28 sm:h-28"
  };
  
  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
    xl: "w-12 h-12"
  };
  
  // Use optimized placeholder based on size
  const placeholderImage = getOptimizedPlaceholder(imageSizeMap[size]);
  
  // Use rapper image if available and not empty, otherwise use optimized placeholder
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;
  
  console.log('RapperAvatar loading:', {
    rapperId: rapper.id,
    rapperName: rapper.name,
    size: imageSizeMap[size],
    imageUrl,
    imageToDisplay,
    placeholderImage
  });
  
  return (
    <Link to={`/rapper/${rapper.slug || rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center border-2 border-rap-gold/30 group-hover:border-rap-gold transition-colors`}>
        <img 
          src={imageToDisplay}
          alt={rapper.name} 
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          loading="lazy"
          onLoad={() => console.log('Image loaded successfully:', imageToDisplay)}
          onError={(e) => {
            console.error('Image failed to load:', imageToDisplay);
            const target = e.target as HTMLImageElement;
            if (!target.src.includes(placeholderImage)) {
              console.log('Falling back to placeholder:', placeholderImage);
              target.src = placeholderImage;
            }
          }}
        />
      </div>
    </Link>
  );
};

export default RapperAvatar;
