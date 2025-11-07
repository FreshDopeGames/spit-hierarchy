
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const GuestCallToAction = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="mt-12 text-center bg-black border border-[var(--theme-primary)]/40 rounded-lg p-8 shadow-2xl shadow-[var(--theme-primary)]/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-[var(--theme-primary)]"></div>
      <h3 className="text-2xl font-[var(--theme-font-display)] text-white mb-4">
        Ready to Join the Culture?
      </h3>
      <p className="text-white mb-6 font-[var(--theme-font-body)]">
        Join the legion of rap legends, unlock exclusive flow insights, and etch your name in the history of the culture.
      </p>
      <Link to="/auth">
        <Button size="lg" className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryLight)] text-[var(--theme-background)] font-[var(--theme-font-heading)] shadow-xl shadow-[var(--theme-primary)]/40 border border-[var(--theme-primary)]/30">
          Start Ranking - Free
        </Button>
      </Link>
    </div>
  );
};

export default GuestCallToAction;
