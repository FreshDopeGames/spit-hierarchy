import { Link } from "react-router-dom";
import { Trophy, TrendingUp, Users, Sparkles, Lock, ArrowRight } from "lucide-react";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import HeaderNavigation from "@/components/HeaderNavigation";
import Footer from "@/components/Footer";
import GlobalStatsCards from "./GlobalStatsCards";
import TopMembersCards from "./TopMembersCards";

const GuestAnalyticsView = () => {
  return (
    <div className="min-h-screen bg-[var(--theme-element-page-background-bg,var(--theme-background))]">
      <HeaderNavigation isScrolled={false} />
      
      <div className="container mx-auto px-4 py-8 md:py-12 pt-24">
        {/* Hero CTA Section */}
        <div className="mb-8 md:mb-12">
          <ThemedCard className="bg-gradient-to-br from-[hsl(var(--theme-primary))]/20 via-black to-black border-[hsl(var(--theme-primary))] border-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[hsl(var(--theme-primary))]/10 rounded-full blur-3xl" />
            <ThemedCardContent className="p-8 md:p-12 relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
                <h1 className="font-ceviche text-[hsl(var(--theme-primary))] text-4xl md:text-6xl">
                  Analytics Dashboard
                </h1>
              </div>
              <p className="text-[hsl(var(--theme-text))] text-lg md:text-xl mb-6 max-w-2xl">
                Track your hip-hop knowledge, earn achievements, and see how you rank against the most passionate fans in the world.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/auth">
                  <ThemedButton 
                    size="lg"
                    className="bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/90 text-black font-bold text-lg shadow-lg shadow-[hsl(var(--theme-primary))]/50"
                  >
                    Join Free in 30 Seconds
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </ThemedButton>
                </Link>
                <ThemedButton 
                  variant="outline"
                  size="lg"
                  className="border-[hsl(var(--theme-primary))] text-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/10"
                  onClick={() => {
                    document.getElementById('preview-section')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  See Preview Below
                </ThemedButton>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </div>

        {/* Preview Section */}
        <div id="preview-section" className="space-y-8">
          {/* Platform Stats - Fully Visible */}
          <div>
            <h2 className="font-ceviche text-[hsl(var(--theme-primary))] text-3xl md:text-5xl mb-4">
              Platform Statistics
            </h2>
            <p className="text-[hsl(var(--theme-text))]/70 mb-6 text-lg">
              Real-time stats from our growing community
            </p>
            <GlobalStatsCards />
          </div>

          {/* Top Members Preview - Limited to Top 5 */}
          <div className="relative">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h2 className="font-ceviche text-[hsl(var(--theme-primary))] text-3xl md:text-5xl">
                  Top Community Members
                </h2>
                <p className="text-[hsl(var(--theme-text))]/70 mt-2 text-lg">
                  Preview of our most active members
                </p>
              </div>
              <Link to="/auth">
                <ThemedButton 
                  className="bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/90 text-black font-semibold"
                >
                  <Lock className="w-4 h-4 mr-2" />
                  See Full Leaderboard
                </ThemedButton>
              </Link>
            </div>
            <TopMembersCards timeRange="all" />
          </div>

          {/* Mid-Page CTA */}
          <ThemedCard className="bg-black border-[hsl(var(--theme-primary))] border-2">
            <ThemedCardContent className="p-8 md:p-10 text-center">
              <Trophy className="w-16 h-16 text-[hsl(var(--theme-primary))] mx-auto mb-4" />
              <h3 className="font-ceviche text-[hsl(var(--theme-primary))] text-3xl md:text-4xl mb-4">
                Unlock Your Personal Stats
              </h3>
              <p className="text-[hsl(var(--theme-text))] text-lg mb-6 max-w-2xl mx-auto">
                Members can track 20+ personal statistics including voting history, achievement progress, favorite rappers, and see how they rank globally.
              </p>
              <Link to="/auth">
                <ThemedButton 
                  size="lg"
                  className="bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/90 text-black font-bold text-lg"
                >
                  Create Free Account
                </ThemedButton>
              </Link>
            </ThemedCardContent>
          </ThemedCard>

          {/* Locked Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ThemedCard className="bg-black/50 border-[hsl(var(--theme-primary))]/50 border-2 relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-[hsl(var(--theme-primary))] mx-auto mb-2" />
                  <p className="text-[hsl(var(--theme-primary))] font-bold text-lg">Members Only</p>
                </div>
              </div>
              <ThemedCardHeader>
                <ThemedCardTitle className="text-[hsl(var(--theme-primary))] font-mogra">
                  <Users className="w-6 h-6 inline mr-2" />
                  My Voting History
                </ThemedCardTitle>
              </ThemedCardHeader>
              <ThemedCardContent>
                <p className="text-[hsl(var(--theme-text))]/70">
                  Track all your votes, ratings, and rankings over time
                </p>
              </ThemedCardContent>
            </ThemedCard>

            <ThemedCard className="bg-black/50 border-[hsl(var(--theme-primary))]/50 border-2 relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-[hsl(var(--theme-primary))] mx-auto mb-2" />
                  <p className="text-[hsl(var(--theme-primary))] font-bold text-lg">Members Only</p>
                </div>
              </div>
              <ThemedCardHeader>
                <ThemedCardTitle className="text-[hsl(var(--theme-primary))] font-mogra">
                  <Trophy className="w-6 h-6 inline mr-2" />
                  Achievement Progress
                </ThemedCardTitle>
              </ThemedCardHeader>
              <ThemedCardContent>
                <p className="text-[hsl(var(--theme-text))]/70">
                  Unlock badges and track your hip-hop knowledge journey
                </p>
              </ThemedCardContent>
            </ThemedCard>

            <ThemedCard className="bg-black/50 border-[hsl(var(--theme-primary))]/50 border-2 relative overflow-hidden">
              <div className="absolute inset-0 backdrop-blur-sm bg-black/60 z-10 flex items-center justify-center">
                <div className="text-center">
                  <Lock className="w-12 h-12 text-[hsl(var(--theme-primary))] mx-auto mb-2" />
                  <p className="text-[hsl(var(--theme-primary))] font-bold text-lg">Members Only</p>
                </div>
              </div>
              <ThemedCardHeader>
                <ThemedCardTitle className="text-[hsl(var(--theme-primary))] font-mogra">
                  <TrendingUp className="w-6 h-6 inline mr-2" />
                  Personal Insights
                </ThemedCardTitle>
              </ThemedCardHeader>
              <ThemedCardContent>
                <p className="text-[hsl(var(--theme-text))]/70">
                  See your most-voted rappers, favorite categories, and more
                </p>
              </ThemedCardContent>
            </ThemedCard>
          </div>

          {/* Bottom CTA */}
          <ThemedCard className="bg-gradient-to-r from-[hsl(var(--theme-primary))]/20 to-black border-[hsl(var(--theme-primary))] border-2">
            <ThemedCardContent className="p-8 md:p-10">
              <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex-1 text-center md:text-left">
                  <h3 className="font-ceviche text-[hsl(var(--theme-primary))] text-3xl md:text-4xl mb-3">
                    Ready to Join?
                  </h3>
                  <p className="text-[hsl(var(--theme-text))] text-lg">
                    It's 100% free. No credit card required. Start tracking your hip-hop knowledge today.
                  </p>
                </div>
                <Link to="/auth">
                  <ThemedButton 
                    size="lg"
                    className="bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/90 text-black font-bold text-xl px-8 py-6 shadow-lg shadow-[hsl(var(--theme-primary))]/50"
                  >
                    Sign Up Free
                    <ArrowRight className="ml-2 w-6 h-6" />
                  </ThemedButton>
                </Link>
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </div>
      </div>

      {/* Sticky Mobile CTA */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/95 border-t-2 border-[hsl(var(--theme-primary))] backdrop-blur-sm z-40 md:hidden">
        <Link to="/auth" className="block">
          <ThemedButton 
            size="lg"
            className="w-full bg-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/90 text-black font-bold"
          >
            <Lock className="w-4 h-4 mr-2" />
            Unlock Full Analytics
          </ThemedButton>
        </Link>
      </div>

      <Footer />
    </div>
  );
};

export default GuestAnalyticsView;
