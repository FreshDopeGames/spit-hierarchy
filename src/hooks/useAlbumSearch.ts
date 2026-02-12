import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AlbumSearchResult {
  id: string;
  title: string;
  slug: string;
  cover_art_url: string | null;
  cached_cover_url: string | null;
  release_type: string;
  rapper_name: string;
  rapper_slug: string;
}

export const useAlbumSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const { data: searchResults = [], isLoading } = useQuery({
    queryKey: ["album-search", debouncedSearchTerm],
    queryFn: async (): Promise<AlbumSearchResult[]> => {
      if (debouncedSearchTerm.length < 2) return [];

      const { data, error } = await supabase
        .from("albums")
        .select("id, title, slug, cover_art_url, cached_cover_url, release_type, rapper_albums(rappers(name, slug))")
        .ilike("title", `%${debouncedSearchTerm}%`)
        .limit(15);

      if (error) {
        console.error("[AlbumSearch] error:", error);
        return [];
      }

      // Flatten the nested join
      const results: AlbumSearchResult[] = [];
      for (const album of data || []) {
        const rapperAlbums = album.rapper_albums as any[];
        if (rapperAlbums && rapperAlbums.length > 0) {
          const rapper = rapperAlbums[0]?.rappers;
          if (rapper) {
            results.push({
              id: album.id,
              title: album.title,
              slug: album.slug,
              cover_art_url: album.cover_art_url,
              cached_cover_url: album.cached_cover_url,
              release_type: album.release_type,
              rapper_name: rapper.name,
              rapper_slug: rapper.slug,
            });
          }
        }
      }

      return results;
    },
    enabled: debouncedSearchTerm.length >= 2,
    staleTime: 5 * 60 * 1000,
  });

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    isSearching: isLoading,
    hasMinLength: searchTerm.length >= 2,
  };
};
