import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Trophy, User, BarChart3, Settings, LogIn, Home, Menu, Info, Calendar } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface NavigationSidebarProps {
  trigger?: React.ReactNode;
}
const NavigationSidebar = ({
  trigger
}: NavigationSidebarProps) => {
  const {
    user,
    signOut
  } = useAuth();

  // Get user profile for avatar and username
  const {
    data: userProfile
  } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const {
        data,
        error
      } = await supabase.from('profiles').select('username, full_name, avatar_url').eq('id', user.id).single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;

    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;

    // Construct the thumb size URL for sidebar
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };
  const avatarUrl = getAvatarUrl(userProfile?.avatar_url);
  const defaultTrigger = <Button variant="outline" size="icon" className="bg-rap-gold border-2 border-black text-black hover:bg-rap-gold/80 shadow-lg">
      <Menu className="h-4 w-4" />
    </Button>;
  const displayName = userProfile?.username || userProfile?.full_name || user?.email;
  return <Sheet>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent side="left" className="w-80 bg-black border-rap-gold/50 shadow-2xl shadow-rap-gold/20">
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center space-x-3">
            <img src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" alt="Spit Hierarchy Logo" className="w-12 h-8" />
            <div>
              <h1 className="font-ceviche bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent text-3xl">
                Spit Hierarchy
              </h1>
              <span className="text-xs text-rap-gold/60 font-merienda tracking-widest font-extrabold">The Ultimate Rankings</span>
            </div>
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 className="text-rap-gold font-ceviche mb-3 tracking-wider text-3xl">Navigate</h3>
            
            <Link to="/" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                <Home className="w-4 h-4 mr-3" />
                Home
              </Button>
            </Link>

            <Link to="/rankings" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                <Trophy className="w-4 h-4 mr-3" />
                Rankings
              </Button>
            </Link>

            <Link to="/all-rappers" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                <Music className="w-4 h-4 mr-3" />
                All Artists
              </Button>
            </Link>

            <Link to="/blog" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                <Calendar className="w-4 h-4 mr-3" />
                Slick Talk
              </Button>
            </Link>

            <Link to="/about" onClick={() => window.scrollTo(0, 0)}>
              <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                <Info className="w-4 h-4 mr-3" />
                About
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div className="border-t border-rap-gold/30 pt-4 space-y-2">
            {user ? <>
                <h3 className="text-rap-gold font-ceviche mb-3 tracking-wider text-3xl">User Menu</h3>
                <Link to="/profile" onClick={() => window.scrollTo(0, 0)}>
                  <div className="flex items-center space-x-3 p-3 hover:bg-rap-gold/20 rounded-lg transition-colors cursor-pointer">
                    <Avatar className="w-8 h-8 border-2 border-rap-gold/50">
                      <AvatarImage src={avatarUrl} alt={displayName || 'User'} />
                      <AvatarFallback className="bg-gradient-to-r from-rap-burgundy to-rap-gold text-rap-platinum">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-rap-gold/70 font-kaushan text-sm">{displayName}</span>
                  </div>
                </Link>

                <Link to="/analytics" onClick={() => window.scrollTo(0, 0)}>
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </Button>
                </Link>

                <Link to="/admin" onClick={() => window.scrollTo(0, 0)}>
                  <Button variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                    <Settings className="w-4 h-4 mr-3" />
                    Admin
                  </Button>
                </Link>

                <Button onClick={signOut} variant="ghost" className="w-full justify-start text-rap-platinum hover:text-rap-gold font-merienda bg-transparent">
                  <LogIn className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </> : <>
                <h3 className="text-rap-gold font-mogra text-sm mb-3 tracking-wider">Get Started</h3>
                
                
                <Link to="/auth" onClick={() => window.scrollTo(0, 0)}>
                  <Button className="w-full font-merienda shadow-lg shadow-rap-gold/30 bg-rap-gold text-black font-extrabold text-xl">
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign In
                  </Button>
                </Link>
              </>}
          </div>
        </nav>
      </SheetContent>
    </Sheet>;
};
export default NavigationSidebar;