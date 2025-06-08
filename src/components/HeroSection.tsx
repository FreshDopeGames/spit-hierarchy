import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
const HeroSection = () => {
  const {
    user
  } = useAuth();
  return <div className="text-center mb-12">
      <h2 className="font-ceviche text-rap-gold mb-4 tracking-wider text-4xl sm:text-6xl md:text-8xl leading-tight">SPIT HIERARCHY</h2>
      <p className="max-w-2xl mx-auto font-merienda leading-relaxed text-lg sm:text-xl md:text-2xl font-extrabold text-rap-silver">
        The Ultimate Rapper Rankings
      </p>
      {!user && <div className="mt-6">
          <Link to="/auth">
            <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
              Join The Cypher
            </Button>
          </Link>
        </div>}
    </div>;
};
export default HeroSection;