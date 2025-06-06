
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const HeroSection = () => {
  const { user } = useAuth();

  return (
    <div className="text-center mb-12">
      <h2 className="font-ceviche text-rap-gold mb-4 tracking-wider text-8xl">
        The Ultimate Rap Rankings
      </h2>
      <p className="max-w-2xl mx-auto font-kaushan leading-relaxed text-2xl font-normal text-rap-smoke">
        The Ultimate Rapper Rankings
      </p>
      {!user && (
        <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
              Join The Cypher
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default HeroSection;
