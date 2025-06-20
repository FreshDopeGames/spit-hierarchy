
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperSearch = (excludeIds: string[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Reduce debounce to 300ms for more responsive search
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

      // Create a more flexible search pattern that handles special characters
      const searchPattern = debouncedSearchTerm
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // Escape special regex characters
        .replace(/\s+/g, '.*') // Replace spaces with .* for flexible matching
        .replace(/\./g, '\\.?') // Make periods optional
        .toLowerCase();

      let query = supabase
        .from("rappers")
        .select("id, name, image_url")
        .order("name")
        .limit(10);

      // Filter out already selected rappers
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Filter results on the client side for more flexible matching
      const filteredData = (data || []).filter(rapper => {
        const name = rapper.name.toLowerCase();
        const term = debouncedSearchTerm.toLowerCase();
        
        // Direct match or contains match
        if (name.includes(term)) return true;
        
        // Remove special characters for comparison
        const cleanName = name.replace(/[^a-zA-Z0-9\s]/g, '');
        const cleanTerm = term.replace(/[^a-zA-Z0-9\s]/g, '');
        
        return cleanName.includes(cleanTerm);
      });

      return filteredData;
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
