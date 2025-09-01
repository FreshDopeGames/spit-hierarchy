import { Tables } from "@/integrations/supabase/types";

export type VSMatchRapper = {
  id: string;
  name: string;
  slug: string;
  real_name: string | null;
  origin: string | null;
  birth_year: number | null;
  average_rating: number | null;
  total_votes: number | null;
  verified: boolean | null;
  album_count?: number;
  top_five_count?: number;
};

export type VSMatchVote = Tables<"vs_match_votes">;

export type VSMatch = Tables<"vs_matches"> & {
  rapper_1: VSMatchRapper;
  rapper_2: VSMatchRapper;
};

export interface VSMatchWithVoteCounts extends VSMatch {
  rapper_1_votes: number;
  rapper_2_votes: number;
  total_votes: number;
  user_vote?: string;
}

export interface CreateVSMatchData {
  title: string;
  description?: string;
  rapper_1_id: string;
  rapper_2_id: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface UpdateVSMatchData extends Partial<CreateVSMatchData> {
  id: string;
}