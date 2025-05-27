
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Settings, BarChart3, LogIn, Trophy, User, Mic } from "lucide-react";
import { Link } from "react-router-dom";
import BlogCarousel from "@/components/BlogCarousel";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      {/* Header */}
      <header className="bg-carbon-fiber border-b border-rap-burgundy/30 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl flex items-center justify-center">
              <Mic className="w-6 h-6 text-rap-silver" />
            </div>
            <h1 className="text-2xl font-graffiti bg-gradient-to-r from-rap-silver to-rap-platinum bg-clip-text text-transparent">
              Lyrical Hierarchy
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/all-rappers">
              <Button variant="outline" className="border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 font-street">
                <Music className="w-4 h-4 mr-2" />
                All Artists
              </Button>
            </Link>
            <Link to="/rankings">
              <Button variant="outline" className="border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 font-street">
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </Button>
            </Link>
            {user ? (
              // Authenticated user navigation
              <>
                <Link to="/profile">
                  <Button variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-street">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </Link>
                <Link to="/analytics">
                  <Button variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-street">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                {/* Admin button - we'll implement role checking later */}
                <Link to="/admin">
                  <Button variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-street">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <span className="text-rap-smoke font-street">Welcome, {user.email}</span>
                <Button onClick={signOut} variant="outline" className="border-rap-silver/50 text-rap-silver hover:bg-rap-silver/20 font-street">
                  Sign Out
                </Button>
              </>
            ) : (
              // Guest user navigation
              <>
                <span className="text-rap-smoke font-street">Browsing as Guest</span>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-graffiti">
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In / Join
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-graffiti text-rap-silver mb-4 animate-text-glow">
            The Ultimate Lyrical Community
          </h2>
          <p className="text-rap-platinum text-lg max-w-2xl mx-auto font-street leading-relaxed">
            Discover the masters of wordplay, vote for your favorite lyricists, and connect with the community that shapes the future of rap culture.
          </p>
          {!user && (
            <div className="mt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-graffiti text-lg">
                  Join the Cypher
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
            <h3 className="text-2xl font-graffiti text-rap-silver mb-4">
              Ready to Drop Your Vote?
            </h3>
            <p className="text-rap-platinum mb-6 font-street">
              Join thousands of hip-hop heads voting on their favorite lyricists, accessing exclusive analytics, and shaping the culture.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-rap-burgundy to-rap-forest hover:from-rap-burgundy-light hover:to-rap-forest-light font-graffiti">
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
