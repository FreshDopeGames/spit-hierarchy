
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Music, Trophy, User, BarChart3, Settings, LogIn, Home, Mic, Menu } from "lucide-react";

interface NavigationSidebarProps {
  trigger?: React.ReactNode;
}

const NavigationSidebar = ({ trigger }: NavigationSidebarProps) => {
  const { user, signOut } = useAuth();

  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="icon"
      className="border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20"
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  return (
    <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-carbon-fiber border-rap-burgundy/50">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl w-10 h-10 flex items-center justify-center">
              <Mic className="text-rap-silver w-6 h-6" />
            </div>
            <div>
              <h1 className="font-graffiti bg-gradient-to-r from-rap-silver to-rap-platinum bg-clip-text text-transparent text-xl">
                Spit Hierarchy
              </h1>
              <span className="text-xs text-rap-smoke font-street">Where Bars Meet Rankings</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-rap-silver font-graffiti text-sm mb-3">Navigate</h3>
            
            <Link to="/">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                <Home className="w-4 h-4 mr-3" />
                Home
              </Button>
            </Link>

            <Link to="/all-rappers">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                <Music className="w-4 h-4 mr-3" />
                All Artists
              </Button>
            </Link>

            <Link to="/rankings">
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                <Trophy className="w-4 h-4 mr-3" />
                Rankings
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="border-t border-rap-burgundy/30 pt-4 space-y-2">
            {user ? (
              <>
                <h3 className="text-rap-silver font-graffiti text-sm mb-3">Your Profile</h3>
                <div className="text-xs text-rap-smoke font-street mb-2 px-3">
                  Welcome, {user.email}
                </div>
                
                <Link to="/profile">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                    <User className="w-4 h-4 mr-3" />
                    Profile
                  </Button>
                </Link>

                <Link to="/analytics">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </Button>
                </Link>

                <Link to="/admin">
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street">
                    <Settings className="w-4 h-4 mr-3" />
                    Admin
                  </Button>
                </Link>

                <Button 
                  onClick={signOut} 
                  variant="ghost" 
                  className="w-full justify-start text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-silver font-street"
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-rap-silver font-graffiti text-sm mb-3">Join the Culture</h3>
                <div className="text-xs text-rap-smoke font-street mb-2 px-3">
                  Browsing as Guest
                </div>
                
                <Link to="/auth">
                  <Button className="w-full bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-graffiti">
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign In / Join
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
