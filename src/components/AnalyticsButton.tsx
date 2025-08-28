
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AnalyticsButton = () => {
  const { user } = useAuth();

  const handleAnalyticsClick = () => {
    window.scrollTo(0, 0);
  };

  return <div className="text-center mt-4 mb-12">
      {user ? <Link to="/analytics" onClick={handleAnalyticsClick}>
          <Button size="lg" className="font-[var(--theme-font-heading)] text-lg shadow-xl shadow-[var(--theme-primary)]/40 border border-[var(--theme-primary)]/30 bg-[var(--theme-primary)] font-extrabold hover:bg-[var(--theme-primaryLight)] hover:text-[var(--theme-primaryDark)] text-[var(--theme-background)]">
            <BarChart3 className="w-5 h-5 mr-2" />
            All Analytics
          </Button>
        </Link> : <Link to="/auth" onClick={handleAnalyticsClick}>
          <Button className="bg-[var(--theme-secondary)] hover:bg-[var(--theme-secondaryLight)] text-[var(--theme-background)] font-[var(--theme-font-heading)] text-lg shadow-xl shadow-[var(--theme-secondary)]/40 border border-[var(--theme-secondary)]/30" size="lg">
            <BarChart3 className="w-5 h-5 mr-2" />
            Sign In to View Analytics
          </Button>
        </Link>}
    </div>;
};

export default AnalyticsButton;
