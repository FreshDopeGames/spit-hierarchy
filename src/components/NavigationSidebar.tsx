
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Music, Trophy, User, BarChart3, Settings, LogIn, Home, Menu, Info } from "lucide-react";

interface NavigationSidebarProps {
  trigger?: React.ReactNode;
}

const NavigationSidebar = ({ trigger }: NavigationSidebarProps) => {
  const { user, signOut } = useAuth();

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="icon"
      className="border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 shadow-lg shadow-rap-gold/20"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-carbon-fiber border-rap-gold/50 shadow-2xl shadow-rap-gold/20">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy Logo" 
              className="w-12 h-8 object-contain animate-glow-pulse"
            />
            <div>
              <h1 className="font-mogra bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent text-xl animate-text-glow">
                Spit Hierarchy
              </h1>
              <span className="text-xs text-rap-gold/60 font-kaushan tracking-widest">The Pharaoh's Cypher</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-rap-gold font-mogra text-sm mb-3 tracking-wider">Navigate the Dynasty</h3>
            
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                <Home className="w-4 h-4 mr-3" />
                The Throne Room
              </Button>
            </Link>

            <Link to="/about">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                <Info className="w-4 h-4 mr-3" />
                Sacred Scrolls
              </Button>
            </Link>

            <Link to="/all-rappers">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                <Music className="w-4 h-4 mr-3" />
                Court of Pharaohs
              </Button>
            </Link>

            <Link to="/rankings">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                <Trophy className="w-4 h-4 mr-3" />
                Hieroglyphic Rankings
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="border-t border-rap-gold/30 pt-4 space-y-2">
            {user ? (
              <>
                <h3 className="text-rap-gold font-mogra text-sm mb-3 tracking-wider">Your Dynasty</h3>
                <div className="text-xs text-rap-gold/70 font-kaushan mb-2 px-3">
                  Pharaoh {user.email}
                </div>
                
                <Link to="/profile">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                    <User className="w-4 h-4 mr-3" />
                    Royal Profile
                  </Button>
                </Link>

                <Link to="/analytics">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Temple Analytics
                  </Button>
                </Link>

                <Link to="/admin">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan">
                    <Settings className="w-4 h-4 mr-3" />
                    High Priest Panel
                  </Button>
                </Link>

                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  className="w-full justify-start text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan"
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  Leave the Realm
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-rap-gold font-mogra text-sm mb-3 tracking-wider">Join the Dynasty</h3>
                <div className="text-xs text-rap-gold/60 font-kaushan mb-2 px-3">
                  Wandering the Tombs
                </div>
                
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-lg shadow-rap-gold/30">
                    <LogIn className="w-4 h-4 mr-3" />
                    Ascend to Power
                  </Button>
                </Link>
              </>
            )}
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSidebar;
