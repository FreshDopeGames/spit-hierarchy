
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, Settings, BarChart3, LogIn, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import BlogCarousel from "@/components/BlogCarousel";
import TopRappersGrid from "@/components/TopRappersGrid";
import StatsOverview from "@/components/StatsOverview";

const Index = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <Music className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Spit Hierarchy
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <Link to="/rankings">
              <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                <Trophy className="w-4 h-4 mr-2" />
                Rankings
              </Button>
            </Link>
            {user ? (
              // Authenticated user navigation
              <>
                <Link to="/analytics">
                  <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                    <BarChart3 className="w-4 h-4 mr-2" />
                    Analytics
                  </Button>
                </Link>
                {/* Admin button - we'll implement role checking later */}
                <Link to="/admin">
                  <Button variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                    <Settings className="w-4 h-4 mr-2" />
                    Admin
                  </Button>
                </Link>
                <span className="text-gray-300">Welcome, {user.email}</span>
                <Button onClick={signOut} variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  Sign Out
                </Button>
              </>
            ) : (
              // Guest user navigation
              <>
                <span className="text-gray-400">Browsing as Guest</span>
                <Link to="/auth">
                  <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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
          <h2 className="text-4xl font-bold text-white mb-4">
            The Ultimate Hip-Hop Community
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Discover the latest in hip-hop culture, vote for your favorite artists, and stay connected with the community that shapes the future of rap.
          </p>
          {!user && (
            <div className="mt-6">
              <Link to="/auth">
                <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  Join the Community
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
          <div className="mt-12 text-center bg-black/40 border border-purple-500/20 rounded-lg p-8">
            <h3 className="text-2xl font-bold text-white mb-4">
              Ready to Make Your Voice Heard?
            </h3>
            <p className="text-gray-300 mb-6">
              Join thousands of hip-hop fans voting on their favorite artists, accessing exclusive analytics, and shaping the culture.
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
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
