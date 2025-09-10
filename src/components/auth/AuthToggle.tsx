import { ThemedButton } from "@/components/ui/themed-button";

interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}

const AuthToggle = ({ isLogin, onToggle }: AuthToggleProps) => {
  return (
    <div className="text-center space-y-4">
      <ThemedButton
        onClick={onToggle}
        variant={isLogin ? "gradient" : "outline"}
        size="lg"
        className="w-full font-merienda font-semibold"
      >
        {isLogin ? "New to the game? Join the Culture" : "Already in the crew? Sign In"}
      </ThemedButton>
      
      <div className="text-xs text-[var(--theme-text-secondary)] font-kaushan">
        <button 
          onClick={() => window.location.href = '/about'} 
          className="hover:text-[var(--theme-text)] transition-colors underline"
        >
          Learn more about Spit Hierarchy
        </button>
      </div>
    </div>
  );
};

export default AuthToggle;