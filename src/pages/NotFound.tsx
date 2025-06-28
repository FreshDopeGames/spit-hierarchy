
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10 text-center p-8">
        <div className="mb-8">
          <img 
            src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
            alt="Spit Hierarchy Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 animate-glow-pulse object-contain"
          />
        </div>
        
        <h1 className="text-6xl font-mogra text-rap-gold mb-4 animate-text-glow">404</h1>
        <h2 className="text-4xl sm:text-5xl font-ceviche text-rap-silver mb-4">Lost in the Tomb</h2>
        <p className="text-rap-platinum font-kaushan text-lg mb-8 max-w-md tracking-wide">
          This scroll has been lost to time. Return to the dynasty and continue your reign.
        </p>
        
        <Link to="/">
          <Button className="bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold hover:from-rap-gold-light hover:via-rap-gold hover:to-rap-gold-dark font-mogra text-rap-carbon px-8 py-3 shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
            <Home className="w-4 h-4 mr-2" />
            Snap Back To Reality
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
