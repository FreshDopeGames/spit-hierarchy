import { ThemedButton } from "@/components/ui/themed-button";

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isLogin, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center space-y-4">
      {isLogin ? (
        <>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[hsl(var(--theme-primary))]/20" />
            </div>
          </div>

          <h2 className="font-ceviche text-rap-silver text-4xl font-normal">
            First Time Here?
          </h2>

          <ThemedButton
            onClick={onToggle}
            size="lg"
            className="w-full font-merienda font-semibold text-lg bg-gradient-to-r from-[#e39516] to-[#c0720c] hover:from-[#c0720c] hover:to-[#e39516] border-0 text-primary-foreground"
          >
            Join the Community
          </ThemedButton>
        </>
      ) : (
        <ThemedButton
          onClick={onToggle}
          variant="outline"
          size="lg"
          className="w-full font-merienda font-semibold bg-transparent text-[hsl(var(--theme-primary))] border-[hsl(var(--theme-primary))]/30 hover:bg-[hsl(var(--theme-primary))]/10"
        >
          Already in the crew? Sign In
        </ThemedButton>
      )}

      <div className="text-xs text-[var(--theme-text-secondary)] font-kaushan">
        <button
          onClick={() => (window.location.href = "/about")}
          className="hover:text-[var(--theme-text)] transition-colors underline"
        >
          Learn more about Spit Hierarchy
        </button>
      </div>
    </div>
  );
};

export default AuthToggle;