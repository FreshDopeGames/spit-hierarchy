import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { createSearchOrQuery, sortBySearchRelevance } from "@/utils/textNormalization";

interface UseRapperAutocompleteOptions {
  excludeIds?: string[];
}

export const useRapperAutocomplete = (options: UseRapperAutocompleteOptions = {}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term with faster 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["rapper-autocomplete", debouncedSearchTerm, options.excludeIds],
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) {
        return [];
      }

      let query = supabase
        .from("rappers")
        .select("id, name, real_name, slug")
        .limit(50); // Reasonable limit for autocomplete

      // Exclude specified IDs
      if (options.excludeIds && options.excludeIds.length > 0) {
        query = query.not("id", "in", `(${options.excludeIds.join(",")})`);
      }

      // Use enhanced search with normalization for both name and real_name
      const searchOrQuery = createSearchOrQuery(debouncedSearchTerm, ['name', 'real_name']);
      query = query.or(searchOrQuery);

      const { data, error } = await query;

      if (error) throw error;
      
      // Sort results by relevance instead of just alphabetical
      const sortedResults = sortBySearchRelevance(data || [], debouncedSearchTerm);
      return sortedResults;
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching: isLoading,
    hasMinLength: debouncedSearchTerm.length >= 2,
  };
};