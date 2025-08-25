
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const HeroSection = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="text-center mb-8 sm:mb-12 px-2 sm:px-0">
      <h2 
        className="font-ceviche mb-4 tracking-wider text-3xl sm:text-4xl md:text-6xl lg:text-8xl leading-tight break-words max-w-full"
        style={{ color: theme.colors.primary }}
      >
        FEATURED SLICK TALK
      </h2>
      {!user && (
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon font-mogra text-base sm:text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30 px-6 sm:px-8">
              Join The Cypher
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
