import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, Home, Trophy, Music, Swords, PenTool, BookOpen, Info, BarChart3, Settings, LogOut } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { ThemedButton } from "@/components/ui/themed-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import UserProfileDropdown from "@/components/UserProfileDropdown";

const NavigationSidebar = ({ 
  trigger, 
  open, 
  onOpenChange 
}: { 
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const isOpen = open !== undefined ? open : internalOpen;
  const handleOpenChange = onOpenChange || setInternalOpen;

  // Handle navigation clicks
  const handleNavClick = (path: string) => {
    handleOpenChange(false);
  };

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    if (baseUrl.startsWith('http')) return baseUrl;
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };

  const avatarUrl = undefined;
  const defaultTrigger = (
    <ThemedButton 
      variant="outline" 
      size="icon" 
      className="border-2 text-[var(--theme-background)] hover:opacity-80 shadow-lg"
      style={{ 
        backgroundColor: theme.colors.primary, 
        borderColor: 'hsl(var(--theme-border))'
      }}
    >
      <Menu className="h-4 w-4" />
    </ThemedButton>
  );

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {trigger || defaultTrigger}
      </SheetTrigger>
      <SheetContent 
        side="left" 
        className="w-80 bg-[var(--theme-surface)] border-r-2 border-[var(--theme-border)] p-0 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="p-6 text-center border-b border-[var(--theme-border)]">
            <SheetTitle className="text-2xl font-mogra text-[var(--theme-primary)]">
              Spit Hierarchy
            </SheetTitle>
            <p className="text-sm text-[var(--theme-textMuted)] font-merienda mt-2">
              Where Real Recognize Real
            </p>
          </SheetHeader>
          
          {/* User Profile Section */}
          {user && (
            <div className="p-6 border-b border-[var(--theme-border)]">
              <UserProfileDropdown 
                userProfile={null}
                isAdmin={false} 
                canManageBlog={false}
                isScrolled={isScrolled}
              />
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
            
            <Link to="/" onClick={() => handleNavClick('/')}>
              <ThemedButton 
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
              </ThemedButton>
            </Link>

            <Link to="/rankings" onClick={() => handleNavClick('/rankings')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Trophy className="w-4 h-4 mr-3" />
                Rankings
              </ThemedButton>
            </Link>

            <Link to="/all-rappers" onClick={() => handleNavClick('/all-rappers')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Music className="w-4 h-4 mr-3" />
                All Rappers
              </ThemedButton>
            </Link>

            <Link to="/vs" onClick={() => handleNavClick('/vs')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Swords className="w-4 h-4 mr-3" />
                VS Matches
              </ThemedButton>
            </Link>

            <Link to="/blog" onClick={() => handleNavClick('/blog')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <BookOpen className="w-4 h-4 mr-3" />
                Slick Talk
              </ThemedButton>
            </Link>

            <Link to="/community-cypher" onClick={() => handleNavClick('/community-cypher')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <PenTool className="w-4 h-4 mr-3" />
                Community Cypher
              </ThemedButton>
            </Link>

            <Link to="/about" onClick={() => handleNavClick('/about')}>
              <ThemedButton 
                variant="ghost" 
                className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                onMouseLeave={(e) => e.currentTarget.style.color = ''}
              >
                <Info className="w-4 h-4 mr-3" />
                About
              </ThemedButton>
            </Link>
            
            </div>
            
            {/* Admin/Analytics Section for logged in users */}
            {user && (
              <>
                <Separator className="my-6" />
                <div className="space-y-2">
                  {/* Analytics always visible to authenticated users */}
                  <Link to="/analytics" onClick={() => handleNavClick('/analytics')}>
                    <ThemedButton 
                      variant="ghost" 
                      className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                      onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <BarChart3 className="w-4 h-4 mr-3" />
                      Analytics
                    </ThemedButton>
                  </Link>

                  <Link to="/admin" onClick={() => handleNavClick('/admin')}>
                    <ThemedButton 
                      variant="ghost" 
                      className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                      onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                      onMouseLeave={(e) => e.currentTarget.style.color = ''}
                    >
                      <Settings className="w-4 h-4 mr-3" />
                      Admin
                    </ThemedButton>
                  </Link>

                  <ThemedButton onClick={() => {
                    // signOut();
                    handleNavClick('/');
                  }}
                    variant="ghost" 
                    className="w-full justify-start text-[var(--theme-text)] font-merienda bg-transparent"
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.colors.primary}
                    onMouseLeave={(e) => e.currentTarget.style.color = ''}
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </ThemedButton>
                </div>
              </>
            )}
            
            {/* Sign in button for non-authenticated users */}
            {!user && (
              <>
                <Separator className="my-6" />
                <Link to="/auth" onClick={() => handleNavClick('/auth')}>
                  <ThemedButton 
                    className="w-full font-merienda shadow-lg text-[var(--theme-textInverted)] font-extrabold text-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryDark)]"
                    size="lg"
                  >
                    Sign In
                  </ThemedButton>
                </Link>
              </>
            )}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default NavigationSidebar;