
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Music, TrendingUp, Users, Award } from "lucide-react";
import RapperGrid from "@/components/RapperGrid";
import CategorySelector from "@/components/CategorySelector";
import StatsOverview from "@/components/StatsOverview";

const Index = () => {
  const { user, signOut } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState<string>("");

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
              Rap Rankings
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
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Vote for the Greatest Rappers of All Time
          </h2>
          <p className="text-gray-300 text-lg max-w-2xl mx-auto">
            Join the community and help rank the most influential artists in hip-hop history. 
            Rate rappers across different categories and see how the community votes.
          </p>
        </div>

        {/* Stats Overview */}
        <StatsOverview />

        {/* Category Filter */}
        <div className="mb-8">
          <CategorySelector 
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        {/* Rapper Grid */}
        <RapperGrid selectedCategory={selectedCategory} />
      </main>
    </div>
  );
};

export default Index;
