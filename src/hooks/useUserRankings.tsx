
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface UserRanking {
  id: string;
  title: string;
  description: string;
  author: string;
  authorId: string;
  createdAt: string;
  timeAgo: string;
  rappers: Array<{
    rank: number;
    name: string;
    reason: string;
  }>;
  likes: number;
  comments: number;
  views: number;
  isPublic: boolean;
  isOfficial: boolean;
  tags: string[];
  slug?: string;
}

export const useUserRankings = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["user-rankings"],
    queryFn: async () => {
      // For now, return the existing mock data since we need to create the database structure first
      // This will be updated once we have the proper tables
      const mockRankings: UserRanking[] = [
        {
          id: "1",
          title: "Top 10 G.O.A.T. Rappers of All Time",
          description: "My personal ranking of the greatest rappers ever, based on lyricism, influence, and cultural impact.",
          author: "HipHopHead92",
          authorId: "user1",
          createdAt: "2024-01-15",
          timeAgo: "3 days ago",
          rappers: [
            { rank: 1, name: "Nas", reason: "Illmatic alone secures his spot" },
            { rank: 2, name: "Jay-Z", reason: "Business acumen and longevity" },
            { rank: 3, name: "Biggie", reason: "Storytelling master" },
            { rank: 4, name: "Tupac", reason: "Raw emotion and social consciousness" },
            { rank: 5, name: "Eminem", reason: "Technical skill and wordplay" },
          ],
          likes: 247,
          comments: 89,
          views: 1240,
          isPublic: true,
          isOfficial: false,
          tags: ["GOAT", "Classic Hip-Hop", "All-Time"]
        },
        {
          id: "2",
          title: "Best New School Rappers (2020-2024)",
          description: "Rising stars who are shaping the future of hip-hop right now.",
          author: "NextGenMusic",
          authorId: "user2",
          createdAt: "2024-01-10",
          timeAgo: "1 week ago",
          rappers: [
            { rank: 1, name: "Baby Keem", reason: "Innovative sound and production" },
            { rank: 2, name: "JID", reason: "Incredible flow and technical ability" },
            { rank: 3, name: "Denzel Curry", reason: "Versatility and energy" },
            { rank: 4, name: "Vince Staples", reason: "Unique perspective and delivery" },
            { rank: 5, name: "Earl Sweatshirt", reason: "Artistic evolution and depth" },
          ],
          likes: 156,
          comments: 34,
          views: 890,
          isPublic: true,
          isOfficial: false,
          tags: ["New School", "2020s", "Rising Stars"]
        },
        {
          id: "3",
          title: "Best Lyricists in Hip-Hop",
          description: "Ranking rappers purely on their lyrical ability and wordplay.",
          author: "WordplayWizard",
          authorId: "user3",
          createdAt: "2024-01-08",
          timeAgo: "1 week ago",
          rappers: [
            { rank: 1, name: "MF DOOM", reason: "Complex wordplay and metaphors" },
            { rank: 2, name: "Kendrick Lamar", reason: "Storytelling and social commentary" },
            { rank: 3, name: "Black Thought", reason: "Consistent excellence" },
            { rank: 4, name: "Andre 3000", reason: "Creative and unpredictable" },
            { rank: 5, name: "Lupe Fiasco", reason: "Double entendres and complexity" },
          ],
          likes: 203,
          comments: 67,
          views: 1150,
          isPublic: true,
          isOfficial: false,
          tags: ["Lyricism", "Wordplay", "Technical"]
        }
      ];

      return mockRankings;
    }
  });
};

export const useCreateUserRanking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (rankingData: Partial<UserRanking>) => {
      // This will be implemented once we have the proper database structure
      console.log("Creating user ranking:", rankingData);
      throw new Error("User ranking creation not yet implemented - needs database structure");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-rankings"] });
    }
  });
};
