import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateVSMatch, useUpdateVSMatch, useDeleteVSMatch } from "./useVSMatches";
import { VSMatch, CreateVSMatchData, UpdateVSMatchData } from "@/types/vsMatches";

export const useAdminVSMatches = () => {
  const createMutation = useCreateVSMatch();
  const updateMutation = useUpdateVSMatch();
  const deleteMutation = useDeleteVSMatch();

  const {
    data: vsMatches,
    isLoading,
    refetch,
    isFetching
  } = useQuery({
    queryKey: ["admin-vs-matches"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vs_matches")
        .select(`
          *,
          rapper_1:rappers!rapper_1_id(id, name, slug, real_name, origin, birth_year, average_rating, total_votes, verified),
          rapper_2:rappers!rapper_2_id(id, name, slug, real_name, origin, birth_year, average_rating, total_votes, verified)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as VSMatch[];
    },
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  const createVSMatch = async (data: CreateVSMatchData) => {
    return createMutation.mutateAsync(data);
  };

  const updateVSMatch = async (data: UpdateVSMatchData) => {
    return updateMutation.mutateAsync(data);
  };

  const deleteVSMatch = async (id: string) => {
    return deleteMutation.mutateAsync(id);
  };

  return {
    vsMatches,
    isLoading,
    isFetching,
    refetch,
    createVSMatch,
    updateVSMatch,
    deleteVSMatch,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};