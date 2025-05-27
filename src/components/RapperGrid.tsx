
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import RapperSortControls from "./RapperSortControls";
import RapperGridCard from "./RapperGridCard";
import RapperGridSkeleton from "./RapperGridSkeleton";

type Rapper = Tables<"rappers">;

interface RapperGridProps {
  selectedCategory: string;
}

const RapperGrid = ({ selectedCategory }: RapperGridProps) => {
  const [sortBy, setSortBy] = useState<"name" | "rating" | "votes">("rating");

  const { data: rappers, isLoading } = useQuery({
    queryKey: ["rappers", sortBy],
    queryFn: async () => {
      let query = supabase
        .from("rappers")
        .select("*");

      switch (sortBy) {
        case "rating":
          query = query.order("average_rating", { ascending: false });
          break;
        case "votes":
          query = query.order("total_votes", { ascending: false });
          break;
        case "name":
          query = query.order("name", { ascending: true });
          break;
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
    return <RapperGridSkeleton />;
  }

  return (
    <>
      <RapperSortControls sortBy={sortBy} onSortChange={setSortBy} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {rappers?.map((rapper, index) => (
          <RapperGridCard
            key={rapper.id}
            rapper={rapper}
            index={index}
            sortBy={sortBy}
            selectedCategory={selectedCategory}
          />
        ))}
      </div>
    </>
  );
};

export default RapperGrid;
