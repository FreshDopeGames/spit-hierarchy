
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const AnalyticsButton = () => {
  const { user } = useAuth();

  return <div className="text-center mt-8 mb-12">
      {user ? <Link to="/analytics">
          <Button size="lg" className="font-merienda text-lg shadow-xl shadow-rap-silver/40 border border-rap-silver/30 bg-rap-gold-dark font-extrabold hover:bg-rap-gold text-rap-carbon">
            <BarChart3 className="w-5 h-5 mr-2" />
            View Full Analytics Dashboard
          </Button>
        </Link> : <Link to="/auth">
          <Button className="bg-rap-silver hover:bg-rap-platinum text-rap-carbon font-mogra text-lg shadow-xl shadow-rap-silver/40 border border-rap-silver/30" size="lg">
            <BarChart3 className="w-5 h-5 mr-2" />
            Sign In to View Analytics
          </Button>
        </Link>}
    </div>;
};

export default AnalyticsButton;
