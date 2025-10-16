import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

      try {
        const { data, error } = await supabase.rpc('search_rappers', {
          search_term: debouncedSearchTerm,
          exclude_ids: options.excludeIds || [],
          max_results: 50
        });

        if (error) {
          console.error("[Autocomplete] search error:", error);
          return [];
        }

        console.log('[Autocomplete]', debouncedSearchTerm, 'results:', (data || []).length);
        return data || [];
      } catch (err) {
        console.error("[Autocomplete] unexpected error:", err);
        return [];
      }
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching: isLoading,
    hasMinLength: searchTerm.length >= 2,
  };
};