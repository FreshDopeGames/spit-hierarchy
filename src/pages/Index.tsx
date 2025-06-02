
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Music, LogIn, Trophy, User, Settings, Bell, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import BlogCarousel from "@/components/BlogCarousel";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";

const Index = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // Check if user has admin role
  const { data: userRoles } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Get user profile for avatar
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin');
  const canManageBlog = userRoles?.some(role => role.role === 'admin' || role.role === 'blog_editor');
  
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-rap-carbon/95 backdrop-blur-md border-b border-rap-gold/50 py-2' : 'bg-carbon-fiber border-b border-rap-gold/30 py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" alt="Spit Hierarchy Logo" className={`object-contain transition-all duration-300 ${isScrolled ? 'w-12 h-8' : 'w-16 h-12'} animate-glow-pulse`} />
            <div className="flex flex-col px-[40px]">
              <h1 className={`font-mogra bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-2xl'} animate-text-glow`}>Spit Hierarchy</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/all-rappers">
              <Button variant="outline" className={`border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
                <Music className="w-4 h-4 mr-2" />
                All Artists
              </Button>
            </Link>
            <Link to="/rankings">
              <Button variant="outline" className={`border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </Button>
            </Link>
            
            {user ? (
              // Authenticated user navigation with avatar and dropdown
              <div className="flex items-center space-x-3">
                {!isScrolled && (
                  <span className="text-rap-gold/70 font-kaushan">
                    Welcome, Pharaoh {userProfile?.username || user.email}
                  </span>
                )}
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 cursor-pointer">
                      <Avatar className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-rap-gold/50 hover:border-rap-gold`}>
                        <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username || 'User'} />
                        <AvatarFallback className="bg-gradient-to-r from-rap-burgundy to-rap-gold text-rap-platinum font-mogra text-sm">
                          {getUserInitials()}
                        </AvatarFallback>
                      </Avatar>
                      <Button variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
                        <User className="w-4 h-4 mr-2" />
                        Profile
                      </Button>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56 bg-carbon-fiber border-rap-gold/30 shadow-2xl shadow-rap-gold/20" align="end">
                    <Link to="/profile">
                      <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                        <User className="w-4 h-4 mr-3" />
                        View Profile
                      </DropdownMenuItem>
                    </Link>
                    
                    <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                      <Bell className="w-4 h-4 mr-3" />
                      Notifications
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator className="bg-rap-smoke/30" />
                    
                    <Link to="/analytics">
                      <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                        <Trophy className="w-4 h-4 mr-3" />
                        Analytics
                      </DropdownMenuItem>
                    </Link>
                    
                    {(isAdmin || canManageBlog) && (
                      <>
                        <DropdownMenuSeparator className="bg-rap-smoke/30" />
                        <Link to="/admin">
                          <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                            <Settings className="w-4 h-4 mr-3" />
                            Admin Panel
                          </DropdownMenuItem>
                        </Link>
                      </>
                    )}
                    
                    <DropdownMenuSeparator className="bg-rap-smoke/30" />
                    
                    <DropdownMenuItem 
                      onClick={signOut}
                      className="text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-burgundy font-kaushan cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              // Guest user navigation with simple "Join In" button
              <div className="flex items-center space-x-4">
                {!isScrolled && <span className="text-rap-gold/60 font-kaushan">Wandering the Tombs</span>}
                <Link to="/auth">
                  <Button className={`bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra transition-all duration-300 shadow-lg shadow-rap-gold/30 ${isScrolled ? 'text-xs px-3 py-1' : ''}`}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isScrolled ? 'Join In' : 'Join In'}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with increased top padding to account for fixed header */}
      <main className="pt-24 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="font-ceviche text-rap-gold mb-4 animate-text-glow tracking-wider text-8xl">
            The Sacred Order of Bars
          </h2>
          <p className="max-w-2xl mx-auto font-kaushan leading-relaxed text-2xl font-normal text-rap-smoke">The Ultimate Rapper Rankings</p>
          {!user && <div className="mt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
                  Claim Your Throne
                </Button>
              </Link>
            </div>}
        </div>

        {/* Featured Blog Posts Carousel */}
        <BlogCarousel />

        {/* Top 5 Rappers Grid */}
        <TopRappersGrid />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Guest user call-to-action */}
        {!user && <div className="mt-12 text-center bg-carbon-fiber border border-rap-gold/40 rounded-lg p-8 shadow-2xl shadow-rap-gold/20 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest"></div>
            <h3 className="text-2xl font-ceviche text-rap-gold mb-4 animate-text-glow">
              Ready to Rule the Realm?
            </h3>
            <p className="text-rap-platinum mb-6 font-kaushan">
              Join the dynasty of lyrical emperors, unlock the sacred scrolls of analytics, and etch your name in the hieroglyphs of hip-hop history.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
                Begin Your Dynasty - Free Ascension
              </Button>
            </Link>
          </div>}
      </main>
    </div>
  );
};

export default Index;
