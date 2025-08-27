
import { Link } from "react-router-dom";
import { ThemedButton } from "@/components/ui/themed-button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

const HeroSection = () => {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <div className="text-center mb-8 sm:mb-12 px-2 sm:px-0">
      <h2 
        className="font-ceviche mb-4 tracking-wider text-3xl sm:text-3xl md:text-4xl lg:text-6xl leading-tight break-words max-w-full"
        style={{ color: theme.colors.primary }}
      >
        FEATURED SLICK TALK
      </h2>
      {!user && (
        <div className="mt-6">
          <Link to="/auth">
            <ThemedButton size="lg" variant="default" className="font-[var(--theme-font-display)] text-base sm:text-lg shadow-xl px-6 sm:px-8">
              Join The Cypher
            </ThemedButton>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
