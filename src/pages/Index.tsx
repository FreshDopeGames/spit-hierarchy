
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Settings, BarChart3, LogIn, Trophy, User } from "lucide-react";
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
          ? 'bg-rap-carbon/95 backdrop-blur-md border-b border-rap-gold/50 py-2' 
          : 'bg-carbon-fiber border-b border-rap-gold/30 py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy Logo" 
              className={`object-contain transition-all duration-300 ${
                isScrolled ? 'w-12 h-8' : 'w-16 h-12'
              } animate-glow-pulse`}
            />
            <div className="flex flex-col">
              <h1 className={`font-mogra bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent transition-all duration-300 ${
                isScrolled ? 'text-lg' : 'text-2xl'
              } animate-text-glow`}>
                Spit Hierarchy
              </h1>
              {!isScrolled && (
                <span className="text-xs text-rap-gold/60 font-kaushan tracking-widest">The Pharaoh's Cypher</span>
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
                {!isScrolled && <span className="text-rap-gold/70 font-kaushan">Welcome, Pharaoh {user.email}</span>}
                <Button onClick={signOut} variant="outline" className={`border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-kaushan transition-all duration-300 ${
                  isScrolled ? 'text-xs px-2 py-1' : ''
                }`}>
                  {isScrolled ? 'Out' : 'Sign Out'}
                </Button>
              </>
            ) : (
              // Guest user navigation
              <>
                {!isScrolled && <span className="text-rap-gold/60 font-kaushan">Wandering the Tombs</span>}
                <Link to="/auth">
                  <Button className={`bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra transition-all duration-300 shadow-lg shadow-rap-gold/30 ${
                    isScrolled ? 'text-xs px-3 py-1' : ''
                  }`}>
                    <LogIn className="w-4 h-4 mr-2" />
                    {isScrolled ? 'Ascend' : 'Enter the Dynasty'}
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
          <h2 className="text-4xl font-ceviche text-rap-gold mb-4 animate-text-glow tracking-wider">
            The Sacred Order of Bars
          </h2>
          <p className="text-rap-platinum text-lg max-w-2xl mx-auto font-kaushan leading-relaxed">
            Where ancient wisdom meets modern wordplay. Join the pharaohs of flow, study the hieroglyphs of hip-hop, and ascend through the dynasty of lyrical supremacy.
          </p>
          {!user && (
            <div className="mt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra text-lg shadow-xl shadow-rap-gold/40 border border-rap-gold/30">
                  Claim Your Throne
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
          <div className="mt-12 text-center bg-carbon-fiber border border-rap-gold/40 rounded-lg p-8 shadow-2xl shadow-rap-gold/20 relative overflow-hidden">
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
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
