
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
        // Create base query
        let query = supabase
          .from("rappers")
          .select("id, name, image_url");

        // Filter out already selected rappers
        if (excludeIds.length > 0) {
          query = query.not("id", "in", `(${excludeIds.join(",")})`);
        }

        // Create search variations
        const searchLower = debouncedSearchTerm.toLowerCase().trim();
        const searchNoPeriods = searchLower.replace(/\./g, '');
        const searchNoSpaces = searchLower.replace(/\s+/g, '');

        // Try primary search with multiple patterns using proper PostgREST syntax
        const { data: primaryResults, error: primaryError } = await query
          .or(`name.ilike.%${searchLower}%,name.ilike.%${searchNoPeriods}%,name.ilike.%${searchNoSpaces}%`)
          .limit(20);

        if (primaryError) {
          console.error("Primary search error:", primaryError);
        }

        let results = primaryResults || [];
        console.log("Primary search results:", results.length);

        // If no results from primary search, try fallback searches
        if (results.length === 0) {
          console.log("Trying fallback searches...");
          
          // Fallback 1: Simple ilike search
          const { data: fallback1, error: error1 } = await supabase
            .from("rappers")
            .select("id, name, image_url")
            .ilike("name", `%${searchLower}%`)
            .not("id", "in", excludeIds.length > 0 ? `(${excludeIds.join(",")})` : "()")
            .limit(20);

          if (!error1 && fallback1 && fallback1.length > 0) {
            results = fallback1;
            console.log("Fallback 1 results:", results.length);
          } else {
            // Fallback 2: Try without periods/spaces
            const { data: fallback2, error: error2 } = await supabase
              .from("rappers")
              .select("id, name, image_url")
              .ilike("name", `%${searchNoPeriods}%`)
              .not("id", "in", excludeIds.length > 0 ? `(${excludeIds.join(",")})` : "()")
              .limit(20);

            if (!error2 && fallback2) {
              results = fallback2;
              console.log("Fallback 2 results:", results.length);
            }
          }
        }

        // Sort results by relevance
        const sortedResults = results.sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          
          // Exact matches first
          if (aName === searchLower && bName !== searchLower) return -1;
          if (bName === searchLower && aName !== searchLower) return 1;
          
          // Starts with matches next
          if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
          if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
          
          // Contains matches with no periods/spaces
          const aNameClean = aName.replace(/[.\s]/g, '');
          const bNameClean = bName.replace(/[.\s]/g, '');
          const searchClean = searchLower.replace(/[.\s]/g, '');
          
          if (aNameClean.includes(searchClean) && !bNameClean.includes(searchClean)) return -1;
          if (bNameClean.includes(searchClean) && !aNameClean.includes(searchClean)) return 1;
          
          // Then alphabetical
          return aName.localeCompare(bName);
        });

        console.log("Final sorted results:", sortedResults.length, sortedResults.map(r => r.name));
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
