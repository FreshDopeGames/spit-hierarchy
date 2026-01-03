import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Menu,
  Home,
  Trophy,
  Music,
  Swords,
  PenTool,
  BookOpen,
  Info,
  BarChart3,
  Settings,
  LogOut,
  Shield,
  FileText,
  Instagram,
  Brain,
} from "lucide-react";
import { useEnhancedTheme } from "@/hooks/useEnhancedTheme";

const DiscordIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
  </svg>
);

const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

import { ThemedButton } from "@/components/ui/themed-button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ThemedSeparator } from "@/components/ui/themed-separator";
import { ThemedAvatar, ThemedAvatarImage, ThemedAvatarFallback } from "@/components/ui/themed-avatar";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useSecurityContext } from "@/hooks/useSecurityContext";

const NavigationSidebar = ({
  trigger,
  open,
  onOpenChange,
}: {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { theme } = useEnhancedTheme();
  const { user, signOut } = useAuth();
  const { userProfile } = useUserProfile();
  const { isAdmin } = useSecurityContext();
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
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    if (baseUrl.startsWith("http")) return baseUrl;
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };
  const avatarUrl = undefined;
  const defaultTrigger = (
    <ThemedButton
      variant="outline"
      size="icon"
      style={{
        backgroundColor: theme.colors.primary,
        borderColor: "hsl(var(--theme-border))",
      }}
      className="border-2 hover:bg-white hover:opacity-100 shadow-lg bg-theme-primary"
    >
      <Menu className="h-4 w-4 text-black" />
    </ThemedButton>
  );
  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{trigger || defaultTrigger}</SheetTrigger>
      <SheetContent
        side="left"
        className="w-80 bg-[var(--theme-surface)] border-r-2 border-[var(--theme-border)] p-0 overflow-y-auto"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-1 text-center">
            <div className="flex justify-center">
              <img
                src="/lovable-uploads/logo-header.png"
                alt="Spit Hierarchy Logo"
                className="h-14 w-auto"
              />
            </div>
          </SheetHeader>

          {/* User Profile Section */}
          {user && userProfile && (
            <div className="px-6 py-3">
              <Link to="/profile" onClick={() => handleNavClick("/profile")}>
                <div className="flex items-center gap-3 cursor-pointer hover:bg-[hsl(var(--theme-primary))]/10 rounded-lg p-2 -m-2 transition-colors">
                  <ThemedAvatar className="h-10 w-10">
                    <ThemedAvatarImage src={getAvatarUrl(userProfile.avatar_url)} />
                    <ThemedAvatarFallback>{userProfile.username?.[0]?.toUpperCase() || "U"}</ThemedAvatarFallback>
                  </ThemedAvatar>
                  <p className="font-[var(--theme-font-body)] font-bold text-[hsl(var(--theme-text))] text-lg hover:text-[hsl(var(--theme-primary))] transition-colors">
                    {userProfile.username || "User"}
                  </p>
                </div>
              </Link>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="flex-1 p-6">
            <div className="space-y-2">
              <Link to="/" onClick={() => handleNavClick("/")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Home className="w-4 h-4 mr-3" />
                  Home
                </ThemedButton>
              </Link>

              <Link to="/rankings" onClick={() => handleNavClick("/rankings")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Trophy className="w-4 h-4 mr-3" />
                  Rankings
                </ThemedButton>
              </Link>

              <Link to="/all-rappers" onClick={() => handleNavClick("/all-rappers")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Music className="w-4 h-4 mr-3" />
                  All Rappers
                </ThemedButton>
              </Link>

              <Link to="/vs" onClick={() => handleNavClick("/vs")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Swords className="w-4 h-4 mr-3" />
                  VS Matches
                </ThemedButton>
              </Link>

              <Link to="/blog" onClick={() => handleNavClick("/blog")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <BookOpen className="w-4 h-4 mr-3" />
                  Slick Talk
                </ThemedButton>
              </Link>

              <Link to="/community-cypher" onClick={() => handleNavClick("/community-cypher")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <PenTool className="w-4 h-4 mr-3" />
                  Community Cypher
                </ThemedButton>
              </Link>

              <Link to="/quiz" onClick={() => handleNavClick("/quiz")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Brain className="w-4 h-4 mr-3" />
                  Rapper Quiz
                </ThemedButton>
              </Link>

              <Link to="/about" onClick={() => handleNavClick("/about")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Info className="w-4 h-4 mr-3" />
                  About
                </ThemedButton>
              </Link>

              <Link to="/analytics" onClick={() => handleNavClick("/analytics")}>
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <BarChart3 className="w-4 h-4 mr-3" />
                  Analytics
                </ThemedButton>
              </Link>

              <ThemedSeparator className="my-4" />

              <a href="https://instagram.com/spithierarchy" target="_blank" rel="noopener noreferrer">
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <Instagram className="w-4 h-4 mr-3" />
                  Instagram
                </ThemedButton>
              </a>

              <a href="https://discord.gg/aTvt6XbAk" target="_blank" rel="noopener noreferrer">
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <DiscordIcon className="w-4 h-4 mr-3" />
                  Discord
                </ThemedButton>
              </a>

              <a href="https://www.tiktok.com/@spithierarchy" target="_blank" rel="noopener noreferrer">
                <ThemedButton
                  variant="ghost"
                  className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                >
                  <TikTokIcon className="w-4 h-4 mr-3" />
                  TikTok
                </ThemedButton>
              </a>

              {/* Admin and account management for logged in users */}
              {user && (
                <>
                  {isAdmin && (
                    <Link to="/admin" onClick={() => handleNavClick("/admin")}>
                      <ThemedButton
                        variant="ghost"
                        className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin
                      </ThemedButton>
                    </Link>
                  )}

                  <Link to="/privacy" onClick={() => handleNavClick("/privacy")}>
                    <ThemedButton
                      variant="ghost"
                      className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                    >
                      <Shield className="w-4 h-4 mr-3" />
                      Privacy Policy
                    </ThemedButton>
                  </Link>

                  <Link to="/terms" onClick={() => handleNavClick("/terms")}>
                    <ThemedButton
                      variant="ghost"
                      className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-3" />
                      Terms of Service
                    </ThemedButton>
                  </Link>

                  <ThemedButton
                    onClick={() => {
                      signOut();
                      handleNavClick("/");
                    }}
                    variant="ghost"
                    className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </ThemedButton>
                </>
              )}
            </div>

            {/* Sign in button for non-authenticated users */}
            {!user && (
              <>
                <ThemedSeparator className="my-6" />

                <Link to="/privacy" onClick={() => handleNavClick("/privacy")}>
                  <ThemedButton
                    variant="ghost"
                    className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                  >
                    <Shield className="w-4 h-4 mr-3" />
                    Privacy Policy
                  </ThemedButton>
                </Link>

                <Link to="/terms" onClick={() => handleNavClick("/terms")}>
                  <ThemedButton
                    variant="ghost"
                    className="w-full justify-start text-[hsl(var(--theme-primary))] font-[var(--theme-font-body)] bg-transparent hover:bg-white hover:text-black transition-colors"
                  >
                    <FileText className="w-4 h-4 mr-3" />
                    Terms of Service
                  </ThemedButton>
                </Link>

                <ThemedSeparator className="my-6" />

                <Link to="/auth" onClick={() => handleNavClick("/auth")}>
                  <ThemedButton
                    className="w-full font-[var(--theme-font-body)] shadow-lg text-[var(--theme-textInverted)] font-extrabold text-xl bg-[var(--theme-primary)] hover:bg-[var(--theme-primaryDark)]"
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
