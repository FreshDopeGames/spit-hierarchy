import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface CareerLengthStats {
  averageCareerLength: number;
  totalWithCareerData: number;
  activeArtistsCount: number;
  deceasedArtistsCount: number;
  completedCareersCount: number;
}

export const useCareerLengthStats = () => {
  return useQuery({
    queryKey: ["career-length-stats"],
    queryFn: async (): Promise<CareerLengthStats> => {
      // Fetch rappers with their albums
      const { data: rapperData, error } = await supabase
        .from("rappers")
        .select(`
          id,
          name,
          death_year,
          rapper_albums!inner (
            album:albums!inner (
              release_date
            )
          )
        `);

      if (error) throw error;

      const currentYear = new Date().getFullYear();
      const careerLengths: number[] = [];
      let activeCount = 0;
      let deceasedCount = 0;
      let completedCount = 0;

      // Process each rapper
      for (const rapper of rapperData) {
        const albums = rapper.rapper_albums;
        
        // Skip if no albums
        if (!albums || albums.length === 0) continue;

        // Extract release years from albums
        const releaseYears = albums
          .map((ra: any) => {
            const album = ra.album;
            return album?.release_date ? new Date(album.release_date).getFullYear() : null;
          })
          .filter((year): year is number => year !== null && year > 1900 && year <= currentYear);

        // Skip if no valid release dates
        if (releaseYears.length === 0) continue;

        const firstReleaseYear = Math.min(...releaseYears);
        const lastReleaseYear = Math.max(...releaseYears);

        // Determine career end year
        let careerEndYear: number;
        
        if (rapper.death_year && rapper.death_year > firstReleaseYear) {
          // Deceased artist
          careerEndYear = rapper.death_year;
          deceasedCount++;
        } else if (lastReleaseYear >= currentYear - 3) {
          // Still active (released album in last 3 years)
          careerEndYear = currentYear;
          activeCount++;
        } else {
          // Career likely ended (no recent releases, not deceased)
          careerEndYear = lastReleaseYear;
          completedCount++;
        }

        const careerLength = careerEndYear - firstReleaseYear;

        // Quality filter: career length must be reasonable
        if (careerLength > 0 && careerLength <= 80) {
          careerLengths.push(careerLength);
        }
      }

      const averageCareerLength = careerLengths.length > 0
        ? careerLengths.reduce((sum, length) => sum + length, 0) / careerLengths.length
        : 0;

      return {
        averageCareerLength,
        totalWithCareerData: careerLengths.length,
        activeArtistsCount: activeCount,
        deceasedArtistsCount: deceasedCount,
        completedCareersCount: completedCount
      };
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });
};