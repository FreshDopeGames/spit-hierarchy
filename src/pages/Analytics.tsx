
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
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-black/40 border-b border-purple-500/20 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2 text-purple-300 hover:text-purple-200">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Voting Analytics
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {user && (
              <>
                <span className="text-gray-300">Welcome, {user.email}</span>
                <Button onClick={signOut} variant="outline" className="border-purple-500/30 text-purple-300 hover:bg-purple-500/20">
                  Sign Out
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Analytics Dashboard
          </h2>
          <p className="text-gray-300">
            Track voting patterns, user engagement, and community trends
          </p>
        </div>

        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full max-w-3xl grid-cols-5 bg-black/40 border border-purple-500/20">
            <TabsTrigger 
              value="personal" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <User className="w-4 h-4 mr-2" />
              Personal
            </TabsTrigger>
            <TabsTrigger 
              value="platform" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Platform
            </TabsTrigger>
            <TabsTrigger 
              value="trends" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger 
              value="network" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Network className="w-4 h-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger 
              value="astrology" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
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
  );
};

export default Analytics;
