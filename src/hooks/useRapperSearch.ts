
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSearchOrQuery, sortBySearchRelevance } from "@/utils/textNormalization";

export const useRapperSearch = (excludeIds: string[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term with slightly longer delay for better performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["rapper-search", debouncedSearchTerm, excludeIds],
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) return [];

      console.log("Searching for:", debouncedSearchTerm);

      try {
        // Create base query
        let query = supabase
          .from("rappers")
          .select("id, name, image_url, aliases");

        // Filter out already selected rappers
        if (excludeIds.length > 0) {
          query = query.not("id", "in", `(${excludeIds.join(",")})`);
        }

        // Use enhanced search with normalization for name and real_name
        const searchOrQuery = createSearchOrQuery(debouncedSearchTerm, ['name', 'real_name']);
        
        // Also search in aliases array using partial text matching
        const { data: results, error } = await query
          .or(searchOrQuery)
          .limit(20);

        if (error) {
          console.error("Enhanced search error:", error);
          return [];
        }

        // Sort results by relevance using enhanced algorithm
        const sortedResults = sortBySearchRelevance(results || [], debouncedSearchTerm);

        console.log("Enhanced search results:", sortedResults.length, sortedResults.map(r => r.name));
        return sortedResults;

      } catch (error) {
        console.error("Search error:", error);
        return [];
      }
    },
    enabled: debouncedSearchTerm.length >= 2,
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults: searchResults || [],
    isSearching: isLoading,
    hasMinLength: searchTerm.length >= 2,
  };
};
