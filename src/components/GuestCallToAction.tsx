
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const GuestCallToAction = () => {
  const { user } = useAuth();

  if (user) return null;

  return (
    <div className="mt-12 text-center bg-carbon-fiber border border-rap-gold/40 rounded-lg p-8 shadow-2xl shadow-rap-gold/20 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
      <h3 className="text-2xl font-ceviche text-rap-gold mb-4">
        Ready to Join the Culture?
      </h3>
      <p className="text-rap-platinum mb-6 font-kaushan">
        Join the legion of rap legends, unlock exclusive flow insights, and etch your name in the history of the culture.
      </p>
      <Link to="/auth">
        <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
          Start Ranking - Free
        </Button>
      </Link>
    </div>
  );
};

export default GuestCallToAction;
