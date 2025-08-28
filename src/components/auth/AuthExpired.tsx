import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
import { Clock, LogIn, Home } from "lucide-react";

interface AuthExpiredProps {
  wasAdmin?: boolean;
  previousRoute?: string;
}

const AuthExpired = ({ wasAdmin = false, previousRoute }: AuthExpiredProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative flex items-center justify-center">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10 text-center p-8 max-w-lg">
        <div className="mb-8">
          <img 
            src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
            alt="Spit Hierarchy Logo" 
            className="w-32 h-32 sm:w-40 sm:h-40 mx-auto mb-6 animate-glow-pulse object-contain"
          />
        </div>
        
        <Card className="bg-carbon-fiber/90 border border-rap-gold/40 backdrop-blur-sm">
          <CardContent className="p-8">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-rap-gold mr-3" />
              <h1 className="text-3xl font-mogra text-rap-gold">Session Expired</h1>
            </div>
            
            <p className="text-rap-platinum font-kaushan text-lg mb-2">
              Your session has timed out for security reasons.
            </p>
            
            {wasAdmin && (
              <p className="text-rap-gold/80 font-kaushan text-sm mb-6">
                Admin access requires re-authentication.
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" state={{ returnTo: previousRoute }}>
                <Button className="bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold hover:from-rap-gold-light hover:via-rap-gold hover:to-rap-gold-dark font-mogra text-rap-carbon px-6 py-3 shadow-xl shadow-rap-gold/40 border border-rap-gold/30 w-full sm:w-auto">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In Again
                </Button>
              </Link>
              
              <Link to="/">
                <Button variant="outline" className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/10 font-mogra px-6 py-3 w-full sm:w-auto">
                  <Home className="w-4 h-4 mr-2" />
                  Go Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthExpired;