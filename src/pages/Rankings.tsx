
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Users, Plus } from "lucide-react";
import HeaderNavigation from "@/components/HeaderNavigation";
import UserRankingsSection from "@/components/rankings/UserRankingsSection";
import OfficialRankingsSection from "@/components/rankings/OfficialRankingsSection";
import CreateRankingDialog from "@/components/rankings/CreateRankingDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRankingsData } from "@/hooks/useRankingsData";

const Rankings = () => {
  const [activeTab, setActiveTab] = useState("official");
  const { user } = useAuth();
  const { officialRankings, loading } = useRankingsData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={false} />
      
      <div className="max-w-7xl mx-auto pt-20 px-4 pb-12">
        {/* Page Header */}
        <div className="text-center mb-8">
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-ceviche text-rap-gold mb-4">
            Top Rapper Rankings
          </h1>
          <p className="text-lg text-rap-platinum font-merienda max-w-3xl mx-auto">
            Explore comprehensive rankings that showcase the best in hip-hop culture, 
            from official editorial picks to unique community perspectives.
          </p>
        </div>

        {/* Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-black/50 border border-rap-gold/20">
              <TabsTrigger 
                value="official" 
                className="data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra"
              >
                <Trophy className="w-4 h-4 mr-2" />
                Official Rankings
              </TabsTrigger>
              <TabsTrigger 
                value="community" 
                className="data-[state=active]:bg-rap-burgundy data-[state=active]:text-white font-mogra"
              >
                <Users className="w-4 h-4 mr-2" />
                Community Rankings
              </TabsTrigger>
            </TabsList>

            {/* Create Ranking Button - Only show for authenticated users on community tab */}
            {user && activeTab === "community" && (
              <CreateRankingDialog>
                <Button className="bg-rap-burgundy hover:bg-rap-burgundy-dark text-white font-mogra">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Ranking
                </Button>
              </CreateRankingDialog>
            )}
          </div>

          {/* Tab Content */}
          <TabsContent value="official" className="mt-0">
            {loading ? (
              <div className="text-center py-8">
                <p className="text-rap-platinum font-merienda">
                  Loading official rankings...
                </p>
              </div>
            ) : (
              <OfficialRankingsSection rankings={officialRankings} />
            )}
          </TabsContent>

          <TabsContent value="community" className="mt-0">
            <UserRankingsSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Rankings;
