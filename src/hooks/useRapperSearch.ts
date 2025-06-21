
import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

// Helper function to normalize names for better matching
const normalizeName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[.\s]/g, '') // Remove periods and spaces
    .replace(/[^a-z0-9]/g, ''); // Remove any other special characters except alphanumeric
};

// Helper function to create search variations
const createSearchVariations = (term: string): string[] => {
  const variations = [term.toLowerCase()];
  
  // Add variation without periods
  if (term.includes('.')) {
    variations.push(term.replace(/\./g, '').toLowerCase());
  }
  
  // Add variation with periods removed and spaces normalized
  variations.push(term.replace(/[.\s]+/g, '').toLowerCase());
  
  // Add variation with spaces around periods removed
  variations.push(term.replace(/\s*\.\s*/g, '.').toLowerCase());
  
  return [...new Set(variations)]; // Remove duplicates
};

export const useRapperSearch = (excludeIds: string[] = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Reduce debounce to 150ms for more responsive search
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

      let query = supabase
        .from("rappers")
        .select("id, name, image_url")
        .order("name")
        .limit(50); // Increased limit to get more results for better filtering

      // Filter out already selected rappers
      if (excludeIds.length > 0) {
        query = query.not("id", "in", `(${excludeIds.join(",")})`);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Enhanced client-side filtering for better matching
      const searchVariations = createSearchVariations(debouncedSearchTerm);
      const normalizedSearchTerm = normalizeName(debouncedSearchTerm);
      
      const filteredData = (data || []).filter(rapper => {
        const rapperName = rapper.name.toLowerCase();
        const normalizedRapperName = normalizeName(rapper.name);
        
        // Exact match (highest priority)
        if (rapperName === debouncedSearchTerm.toLowerCase()) return true;
        
        // Direct contains match
        if (rapperName.includes(debouncedSearchTerm.toLowerCase())) return true;
        
        // Check against search variations
        for (const variation of searchVariations) {
          if (rapperName.includes(variation)) return true;
          if (rapperName.replace(/[.\s]/g, '').includes(variation)) return true;
        }
        
        // Normalized comparison (handles J.I.D vs JID, etc.)
        if (normalizedRapperName.includes(normalizedSearchTerm)) return true;
        
        // Check if normalized search term matches normalized rapper name
        if (normalizedSearchTerm.length >= 2 && normalizedRapperName.startsWith(normalizedSearchTerm)) return true;
        
        return false;
      });

      // Sort results by relevance
      return filteredData.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        const searchLower = debouncedSearchTerm.toLowerCase();
        
        // Exact matches first
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;
        
        // Starts with matches next
        if (aName.startsWith(searchLower) && !bName.startsWith(searchLower)) return -1;
        if (bName.startsWith(searchLower) && !aName.startsWith(searchLower)) return 1;
        
        // Then alphabetical
        return aName.localeCompare(bName);
      }).slice(0, 15); // Limit final results to 15
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
