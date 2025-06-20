
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useRapperSearch = (excludeIds: string[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term by 2 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 2000);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["rapper-search", debouncedSearchTerm, excludeIds],
    queryFn: async () => {
      if (debouncedSearchTerm.length < 2) return [];

      let query = supabase
        .from("rappers")
        .select("id, name, image_url")
        .ilike("name", `%${debouncedSearchTerm}%`)
        .order("name")
        .limit(10);

      // Filter out already selected rappers
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
