import { Link } from "react-router-dom";
import { ThemedButton } from "@/components/ui/themed-button";
import { useAuth } from "@/hooks/useAuth";
import { useEnhancedTheme } from "@/hooks/useEnhancedTheme";
const HeroSection = () => {
  const {
    user
  } = useAuth();
  const {
    theme
  } = useEnhancedTheme();
  return <div className="text-center mb-6 sm:mb-8 px-2 sm:px-0">
      <h2 className="font-ceviche text-primary mb-4 tracking-wider text-4xl sm:text-6xl leading-tight break-words max-w-full">
        FEATURED SLICK TALK
      </h2>
      {!user && <div className="mt-6">
          <Link to="/auth">
            <ThemedButton size="lg" variant="default" className="font-[var(--theme-font-display)] text-base sm:text-lg shadow-xl px-6 sm:px-8">
              Join The Cypher
            </ThemedButton>
          </Link>
        </div>}
    </div>;
};
export default HeroSection;