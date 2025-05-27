
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { Link } from "react-router-dom";
import { Tables } from "@/integrations/supabase/types";
import RapperCard from "./RapperCard";

type Rapper = Tables<"rappers">;

const TopRappersGrid = () => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["top-rappers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rappers")
        .select("*")
        .order("average_rating", { ascending: false })
        .order("total_votes", { ascending: false })
        .order("name", { ascending: true })
        .limit(5);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return (
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-6 text-center">
          Top 5 Rappers Right Now
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6 md:px-16">
            {Array.from({ length: 2 }).map((_, i) => (
              <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-48 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-700 rounded mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topRappers || topRappers.length === 0) {
    return (
      <div className="mb-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">
            Top 5 Rappers Right Now
          </h2>
          <p className="text-gray-300">
            Based on community votes and ratings
          </p>
        </div>
        <Card className="bg-black/40 border-purple-500/20">
          <CardContent className="p-8 text-center">
            <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No Rappers Yet</h3>
            <p className="text-gray-400 mb-4">The database is empty. Contact admin to add rappers.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Top 5 Rappers Right Now
        </h2>
        <p className="text-gray-300">
          Based on community votes and ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Top Row - First 3 rappers */}
        <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
          {topRappers.slice(0, 3).map((rapper, index) => (
            <RapperCard 
              key={rapper.id} 
              rapper={rapper} 
              position={index + 1} 
            />
          ))}
        </div>

        {/* Bottom Row - Last 2 rappers (if they exist) */}
        {topRappers.length > 3 && (
          <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 md:px-16">
            {topRappers.slice(3, 5).map((rapper, index) => (
              <RapperCard 
                key={rapper.id} 
                rapper={rapper} 
                position={index + 4} 
              />
            ))}
          </div>
        )}
      </div>

      {/* View All Button */}
      <div className="text-center mt-8">
        <Link to="/all-rappers">
          <Button 
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            size="lg"
          >
            View All Rappers
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default TopRappersGrid;
