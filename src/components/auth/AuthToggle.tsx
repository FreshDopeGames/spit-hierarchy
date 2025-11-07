import { ThemedButton } from "@/components/ui/themed-button";
interface AuthToggleProps {
  isLogin: boolean;
  onToggle: () => void;
}
const AuthToggle = ({
  isLogin,
  onToggle
}: AuthToggleProps) => {
  return <div className="text-center space-y-4">
      <ThemedButton 
        onClick={onToggle} 
        variant="outline"
        size="lg" 
        className="w-full font-merienda font-semibold bg-transparent text-[hsl(var(--theme-primary))] border-[hsl(var(--theme-primary))]/30 hover:bg-[hsl(var(--theme-primary))]/10"
      >
        {isLogin ? "New to the game? Join the Culture" : "Already in the crew? Sign In"}
      </ThemedButton>
      
      <div className="text-xs text-[var(--theme-text-secondary)] font-kaushan">
        <button onClick={() => window.location.href = '/about'} className="hover:text-[var(--theme-text)] transition-colors underline">
          Learn more about Spit Hierarchy
        </button>
      </div>
    </div>;
};
export default AuthToggle;