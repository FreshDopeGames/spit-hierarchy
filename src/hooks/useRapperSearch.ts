import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
        const { data: results, error } = await supabase.rpc('search_rappers', {
          search_term: debouncedSearchTerm,
          exclude_ids: excludeIds,
          max_results: 20
        });

        if (error) {
          console.error("Enhanced search error:", error);
          return [];
        }

        console.log("Enhanced search results:", results?.length || 0, results?.map(r => r.name) || []);
        return results || [];

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
