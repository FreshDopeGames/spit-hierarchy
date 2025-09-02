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
  return <div className="text-center mb-8 sm:mb-12 px-2 sm:px-0">
      <h2 style={{
      color: theme.colors.primary
    }} className="font-[var(--theme-font-display)] mb-4 tracking-wider text-3xl sm:text-3xl md:text-4xl leading-tight break-words max-w-full text-amber-500 lg:text-5xl">
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