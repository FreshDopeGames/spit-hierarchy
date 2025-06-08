import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, ArrowLeft, BarChart3, User, TrendingUp, Network, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UserVotingDashboard from "@/components/analytics/UserVotingDashboard";
import VotingAnalytics from "@/components/analytics/VotingAnalytics";
import VotingTrends from "@/components/analytics/VotingTrends";
import TopVoters from "@/components/analytics/TopVoters";
import RapperNetworkGraph from "@/components/analytics/RapperNetworkGraph";
import AstrologicalRankings from "@/components/analytics/AstrologicalRankings";
const Analytics = () => {
  const {
    user,
    signOut
  } = useAuth();
  return <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon relative">
      <div className="absolute inset-0 bg-gradient-to-br from-rap-carbon/80 via-rap-carbon-light/80 to-rap-carbon/80 z-0"></div>
      
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-carbon-fiber/90 border-b border-rap-gold/30 p-4 shadow-lg shadow-rap-gold/20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Link to="/" className="flex items-center space-x-2 text-rap-gold hover:text-rap-gold-light transition-colors font-kaushan">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="w-10 h-10 bg-gradient-to-r from-rap-burgundy to-rap-forest rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-rap-silver" />
              </div>
              <h1 className="text-2xl font-mogra bg-gradient-to-r from-rap-gold to-rap-silver bg-clip-text text-transparent animate-text-glow">
                Analytics Dashboard
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {user && <>
                  <span className="text-rap-platinum font-kaushan">User: {user.email}</span>
                  <Button onClick={signOut} variant="outline" className="border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan">
                    Sign Out
                  </Button>
                </>}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6 pt-24">
          <div className="mb-8">
            <h2 className="text-3xl font-mogra text-rap-gold mb-2 animate-text-glow">
              Community Insights
            </h2>
            <p className="text-rap-platinum font-kaushan text-lg tracking-wide">
              Deep dive into voting patterns and community trends
            </p>
          </div>

          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-carbon-fiber border border-rap-gold/100 border-2 ">
              <TabsTrigger value="personal" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rap-burgundy data-[state=active]:to-rap-forest data-[state=active]:text-rap-platinum font-kaushan">
                <User className="w-4 h-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="platform" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rap-burgundy data-[state=active]:to-rap-forest data-[state=active]:text-rap-platinum font-kaushan">
                <BarChart3 className="w-4 h-4 mr-2" />
                Platform
              </TabsTrigger>
              <TabsTrigger value="trends" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rap-burgundy data-[state=active]:to-rap-forest data-[state=active]:text-rap-platinum font-kaushan">
                <TrendingUp className="w-4 h-4 mr-2" />
                Trends
              </TabsTrigger>
              <TabsTrigger value="network" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rap-burgundy data-[state=active]:to-rap-forest data-[state=active]:text-rap-platinum font-kaushan">
                <Network className="w-4 h-4 mr-2" />
                Network
              </TabsTrigger>
              <TabsTrigger value="astrology" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-rap-burgundy data-[state=active]:to-rap-forest data-[state=active]:text-rap-platinum font-kaushan">
                <Star className="w-4 h-4 mr-2" />
                Astrology
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="mt-6">
              <UserVotingDashboard />
            </TabsContent>

            <TabsContent value="platform" className="mt-6">
              <VotingAnalytics />
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="space-y-6">
                <VotingTrends />
                <TopVoters />
              </div>
            </TabsContent>

            <TabsContent value="network" className="mt-6">
              <RapperNetworkGraph />
            </TabsContent>

            <TabsContent value="astrology" className="mt-6">
              <AstrologicalRankings />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>;
};
export default Analytics;