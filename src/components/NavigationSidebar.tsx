import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Music, Trophy, User, BarChart3, Settings, LogIn, Home, Menu, Info, Calendar, PenTool, Pen, MessageSquare, Swords } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AvatarSkeleton, TextSkeleton } from "@/components/ui/skeleton";

interface NavigationSidebarProps {
  trigger?: React.ReactNode;
}

const NavigationSidebar = ({ trigger }: NavigationSidebarProps) => {
  const { user, signOut, loading: authLoading } = useAuth();
  const { theme } = useTheme();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  // Get user profile for avatar and username
  const { data: userProfile, isLoading: profileLoading } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      // Use secure function to get own profile data
      const { data, error } = await supabase
        .rpc('get_own_profile')
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  // Combined loading state
  const isUserDataLoading = authLoading || (user && profileLoading);

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    if (baseUrl.startsWith('http')) return baseUrl;
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };

  const avatarUrl = getAvatarUrl(userProfile?.avatar_url);
  const defaultTrigger = (
    <Button 
      variant="outline" 
      size="icon" 
      className="border-2 text-[var(--theme-background)] hover:opacity-80 shadow-lg"
      style={{ 
        backgroundColor: theme.colors.primary, 
        borderColor: 'hsl(var(--theme-border))'
      }}
    >
      <Menu className="h-4 w-4" />
    </Button>
  );

  const displayName = userProfile?.username || userProfile?.full_name || user?.email;

  const handleNavClick = (path: string) => {
    setOpen(false);
    window.scrollTo(0, 0);
  };

  // Get Community Cypher icon with priority: PenTool > Pen > MessageSquare
  const CypherIcon = PenTool || Pen || MessageSquare;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 bg-[var(--theme-background)] shadow-2xl"
        style={{ borderColor: `${theme.colors.primary}50` }}
      >
        <SheetHeader className="pb-6">
          <SheetTitle className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Logo" 
              className="w-12 h-8" 
            />
          </SheetTitle>
        </SheetHeader>

        <nav className="space-y-4">
          {/* Main Navigation */}
          <div className="space-y-2">
            <h3 
              className="font-[var(--theme-font-display)] mb-3 tracking-wider text-3xl"
              style={{ color: theme.colors.primary }}
            >
              Navigate
            </h3>
            
            <Link to="/" onClick={() => handleNavClick('/')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                style={{ 
                  '--hover-color': theme.colors.primary 
                } as React.CSSProperties}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Home className="w-4 h-4 mr-3" />
                Home
              </Button>
            </Link>

            <Link to="/rankings" onClick={() => handleNavClick('/rankings')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Trophy className="w-4 h-4 mr-3" />
                Rankings
              </Button>
            </Link>

            <Link to="/all-rappers" onClick={() => handleNavClick('/all-rappers')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Music className="w-4 h-4 mr-3" />
                All Rappers
              </Button>
            </Link>

            <Link to="/vs" onClick={() => handleNavClick('/vs')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Swords className="w-4 h-4 mr-3" />
                VS Matches
              </Button>
            </Link>

            <Link to="/blog" onClick={() => handleNavClick('/blog')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Slick Talk
              </Button>
            </Link>

            <Link to="/community-cypher" onClick={() => handleNavClick('/community-cypher')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <CypherIcon className="w-4 h-4 mr-3" />
                Community Cypher
              </Button>
            </Link>

            <Link to="/about" onClick={() => handleNavClick('/about')}>
              <Button 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Info className="w-4 h-4 mr-3" />
                About
              </Button>
            </Link>
          </div>

          {/* User Section */}
          <div 
            className="pt-4 space-y-2"
            style={{ borderTopColor: `${theme.colors.primary}30`, borderTopWidth: '1px', borderTopStyle: 'solid' }}
          >
            {isUserDataLoading ? (
              <>
                <h3 
                  className="font-[var(--theme-font-display)] mb-3 tracking-wider text-3xl"
                  style={{ color: theme.colors.primary }}
                >
                  Loading...
                </h3>
                <div className="flex items-center space-x-3 p-3">
                  <AvatarSkeleton size="sm" />
                  <TextSkeleton width="w-24" height="h-4" />
                </div>
              </>
            ) : user ? (
              <>
                <h3 
                  className="font-[var(--theme-font-display)] mb-3 tracking-wider text-3xl"
                  style={{ color: theme.colors.primary }}
                >
                  User Menu
                </h3>
                <Link to="/profile" onClick={() => handleNavClick('/profile')}>
                  <div 
                    className="flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer"
                    style={{ 
                      '--hover-bg': `${theme.colors.primary}20` 
                    } as React.CSSProperties}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${theme.colors.primary}20`}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = ''}
                  >
                    <Avatar 
                      className="w-8 h-8 border-2"
                      style={{ borderColor: `${theme.colors.primary}50` }}
                    >
                      <AvatarImage 
                        src={avatarUrl} 
                        alt={displayName || 'User'}
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                      <AvatarFallback className="bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-[var(--theme-background)]">
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <span 
                      className="font-[var(--theme-font-body)] text-sm"
                      style={{ color: `${theme.colors.primary}70` }}
                    >
                      {displayName}
                    </span>
                  </div>
                </Link>

                <Link to="/analytics" onClick={() => handleNavClick('/analytics')}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    <BarChart3 className="w-4 h-4 mr-3" />
                    Analytics
                  </Button>
                </Link>

                <Link to="/admin" onClick={() => handleNavClick('/admin')}>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    <Settings className="w-4 h-4 mr-3" />
                    Admin
                  </Button>
                </Link>

                <Button 
                  onClick={() => {
                    setOpen(false);
                    signOut();
                  }} 
                  variant="ghost" 
                  className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                  onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  <LogIn className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <h3 className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] text-sm mb-3 tracking-wider">Get Started</h3>
                
                <Link to="/auth" onClick={() => handleNavClick('/auth')}>
                  <Button 
                    className="w-full font-merienda shadow-lg text-black font-extrabold text-xl"
                    style={{ 
                      backgroundColor: theme.colors.primary,
                      boxShadow: `0 10px 25px ${theme.colors.primary}30`
                    }}
                  >
                    <LogIn className="w-4 h-4 mr-3" />
                    Sign In
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
