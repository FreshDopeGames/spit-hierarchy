
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Settings, BarChart3, LogIn, Trophy, User, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import BlogCarousel from "@/components/BlogCarousel";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";

const Index = () => {
  const { user, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Sticky Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-rap-carbon/95 backdrop-blur-md border-b border-rap-burgundy/50 py-2' 
          : 'bg-carbon-fiber border-b border-rap-burgundy/30 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl flex items-center justify-center transition-all duration-300 ${
              isScrolled ? 'w-8 h-8' : 'w-10 h-10'
            }`}>
              <Mic className={`text-rap-silver transition-all duration-300 ${
                isScrolled ? 'w-5 h-5' : 'w-6 h-6'
              }`} />
            </div>
            <div className="flex flex-col">
              <h1 className={`font-mogra bg-gradient-to-r from-rap-silver to-rap-platinum bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'text-lg' : 'text-2xl'
              }`}>
                Spit Hierarchy
              </h1>
              {!isScrolled && (
                <span className="text-xs text-rap-smoke font-kaushan">Where Bars Meet Rankings</span>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/all-rappers">
              <Button variant="outline" className={`border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 font-kaushan transition-all duration-300 ${
                isScrolled ? 'text-xs px-2 py-1' : ''
              }`}>
                <Music className="w-4 h-4 mr-2" />
                All Artists
              </Button>
            </Link>
            <Link to="/rankings">
              <Button variant="outline" className={`border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan transition-all duration-300 ${
                isScrolled ? 'text-xs px-2 py-1' : ''
              }`}>
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </Button>
            </Link>
            {user ? (
              // Authenticated user navigation
              <>
                <Link to="/profile">
                  <Button variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${
                    isScrolled ? 'text-xs px-2 py-1' : ''
                  }`}>
                    <User className="w-4 h-4 mr-2" />
                    {isScrolled ? '' : 'Profile'}
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${
                    isScrolled ? 'text-xs px-2 py-1' : ''
                  }`}>
                    <BarChart3 className="w-4 h-4 mr-2" />
                    {isScrolled ? '' : 'Analytics'}
                  </Button>
                </Link>
                {/* Admin button - we'll implement role checking later */}
                <Link to="/admin">
                  <Button variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${
                    isScrolled ? 'text-xs px-2 py-1' : ''
                  }`}>
                    <Settings className="w-4 h-4 mr-2" />
                    {isScrolled ? '' : 'Admin'}
                  </Button>
                </Link>
                {!isScrolled && <span className="text-rap-smoke font-kaushan">Welcome, {user.email}</span>}
                <Button onClick={signOut} variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${
                  isScrolled ? 'text-xs px-2 py-1' : ''
                }`}>
                  {isScrolled ? 'Out' : 'Sign Out'}
                </Button>
              </>
            ) : (
              // Guest user navigation
              <>
                {!isScrolled && <span className="text-rap-smoke font-kaushan">Browsing as Guest</span>}
                <Link to="/auth">
                  <Button className={`bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra transition-all duration-300 ${
                    isScrolled ? 'text-xs px-3 py-1' : ''
                  }`}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isScrolled ? 'Join' : 'Sign In / Join'}
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content with top padding to account for fixed header */}
      <main className="pt-20 max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-ceviche text-rap-silver mb-4 animate-text-glow">
            The Ultimate Lyrical Community
          </h2>
          <p className="text-rap-platinum text-lg max-w-2xl mx-auto font-kaushan leading-relaxed">
            Where wordplay meets warfare. Vote for your favorite lyricists, study the metrics, and connect with the culture that shapes the future of hip-hop.
          </p>
          {!user && (
            <div className="mt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra text-lg">
                  Enter the Cypher
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Featured Blog Posts Carousel */}
        <BlogCarousel />

        {/* Top 5 Rappers Grid */}
        <TopRappersGrid />

        {/* Stats Overview */}
        <StatsOverview />

        {/* Guest user call-to-action */}
        {!user && (
          <div className="mt-12 text-center bg-carbon-fiber border border-rap-burgundy/30 rounded-lg p-8">
            <h3 className="text-2xl font-ceviche text-rap-silver mb-4">
              Ready to Drop Your Vote?
            </h3>
            <p className="text-rap-platinum mb-6 font-kaushan">
              Join thousands of hip-hop heads voting on their favorite lyricists, accessing exclusive analytics, and shaping the culture.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-mogra">
                Sign Up Now - It's Free
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
