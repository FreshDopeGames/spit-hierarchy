import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";
import { getOptimizedPlaceholder } from "@/utils/placeholderImageUtils";
import EnhancedImage from "@/components/ui/EnhancedImage";

type Rapper = Tables<"rappers">;

interface RapperData {
  id: string;
  name: string;
  slug?: string;
}

interface RapperAvatarProps {
  rapper: RapperData;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  imageUrl?: string | null; // Allow passing image URL directly for batch loading
  variant?: "circular" | "square";
  borderColor?: "default" | "black"; // Add border color option
}

const RapperAvatar = ({
  rapper,
  size = "md",
  imageUrl: providedImageUrl,
  variant = "square",
  borderColor = "default",
}: RapperAvatarProps) => {
  // Map avatar sizes to image sizes
  const imageSizeMap = {
    sm: "thumb" as const,
    md: "medium" as const,
    lg: "large" as const,
    xl: "xlarge" as const,
    "2xl": "xlarge" as const,
  };

  const { data: fetchedImageUrl } = useRapperImage(rapper.id, imageSizeMap[size]);

  // Use provided imageUrl if available (from batch loading), otherwise use fetched URL
  const imageUrl = providedImageUrl !== undefined ? providedImageUrl : fetchedImageUrl;

  const sizeClasses = {
    sm: "w-24 h-24 sm:w-28 sm:h-28",
    md: "w-32 h-32 sm:w-36 sm:h-36",
    lg: "w-40 h-40 sm:w-48 sm:h-48",
    xl: "w-48 h-48 sm:w-56 sm:h-56",
    "2xl": "w-64 h-64 sm:w-80 sm:h-80",
  };

  const iconSizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-20 h-20",
    xl: "w-24 h-24",
    "2xl": "w-32 h-32",
  };

  // Use optimized placeholder based on size
  const placeholderImage = getOptimizedPlaceholder(imageSizeMap[size]);

  // Use rapper image if available and not empty, otherwise use optimized placeholder
  const imageToDisplay = imageUrl && imageUrl.trim() !== "" ? imageUrl : placeholderImage;

  // Define border color classes
  const borderColorClass =
    borderColor === "black" ? "border-black" : "border-border group-hover:border-[var(--theme-primary)]";

  // Debug info removed for production

  return (
    <Link to={`/rapper/${rapper.slug || rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
      <div
        className={`${sizeClasses[size]} ${variant === "square" ? "rounded-lg" : "rounded-full"} overflow-hidden bg-gradient-to-br from-[var(--theme-surface)] to-[var(--theme-primary)]/20 flex items-center justify-center border-4 ${borderColorClass} transition-colors`}
      >
        <EnhancedImage
          src={imageToDisplay}
          alt={rapper.name}
          className="group-hover:scale-110 transition-transform duration-300"
          size={imageSizeMap[size]}
          priority={size === "xl" || size === "2xl"}
          onLoad={() => {
            /* Image loaded */
          }}
          onError={(e) => {
            console.error("Image failed to load:", imageToDisplay);
            const target = e.target as HTMLImageElement;
            if (!target.src.includes(placeholderImage)) {
              target.src = placeholderImage;
            }
          }}
        />
      </div>
    </Link>
  );
};

export default RapperAvatar;
