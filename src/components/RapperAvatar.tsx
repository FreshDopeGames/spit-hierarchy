
import { Link } from "react-router-dom";
import { Music } from "lucide-react";
import { Tables } from "@/integrations/supabase/types";
import { useRapperImage } from "@/hooks/useImageStyle";

type Rapper = Tables<"rappers">;

interface RapperAvatarProps {
  rapper: Rapper;
  size?: "sm" | "md" | "lg";
}

const RapperAvatar = ({ rapper, size = "md" }: RapperAvatarProps) => {
  const { data: imageUrl } = useRapperImage(rapper.id);
  
  const sizeClasses = {
    sm: "w-12 h-12 sm:w-14 sm:h-14",
    md: "w-16 h-16 sm:w-18 sm:h-18",
    lg: "w-20 h-20 sm:w-24 sm:h-24"
  };
  
  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10"
  };
  
  return (
    <Link to={`/rapper/${rapper.id}`} className="group" onClick={() => window.scrollTo(0, 0)}>
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-rap-carbon to-rap-carbon-light flex items-center justify-center border-2 border-rap-gold/30 group-hover:border-rap-gold transition-colors`}>
        {imageUrl ? 
          <img src={imageUrl} alt={rapper.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" /> : 
          <Music className={`${iconSizeClasses[size]} text-rap-platinum/50`} />
        }
      </div>
    </Link>
  );
};

export default RapperAvatar;
