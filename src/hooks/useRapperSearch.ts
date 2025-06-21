
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperSearch = (excludeIds: string[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 150);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["rapper-search", debouncedSearchTerm, excludeIds],
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) return [];

      // Create base query
      let query = supabase
        .from("rappers")
        .select("id, name, image_url")
        .limit(20);

      // Filter out already selected rappers
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      // Create search variations for database-level filtering
      const searchLower = debouncedSearchTerm.toLowerCase().trim();
      const searchNoPeriods = searchLower.replace(/\./g, '');
      const searchNoSpaces = searchLower.replace(/\s+/g, '');
      const searchNoPuncuation = searchLower.replace(/[.\s]/g, '');

      // Use database-level OR filtering with ilike for case-insensitive partial matches
      const { data, error } = await query.or(`
        name.ilike.%${searchLower}%,
        name.ilike.%${searchNoPeriods}%,
        name.ilike.%${searchNoSpaces}%,
        name.ilike.%${searchNoPuncuation}%
      `);

      if (error) {
        console.error("Search error:", error);
        throw error;
      }

      if (!data) return [];

      // Simple client-side sorting by relevance (exact matches first, then alphabetical)
      return data.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact matches first
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;
        
        // Starts with matches next
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
        
        // Then alphabetical
        return aName.localeCompare(bName);
      });
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
