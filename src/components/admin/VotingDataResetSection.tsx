import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, RotateCcw, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ThemedCard as Card, ThemedCardContent as CardContent, ThemedCardDescription as CardDescription, ThemedCardHeader as CardHeader, ThemedCardTitle as CardTitle } from "@/components/ui/themed-card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";

interface ResetResult {
  success: boolean;
  message: string;
  details: {
    votes_deleted: number;
    ranking_votes_deleted: number;
    daily_tracking_deleted: number;
    vote_notes_deleted: number;
    position_history_deleted: number;
    rappers_updated: number;
    member_stats_updated: number;
    reset_timestamp: string;
  };
}

const VotingDataResetSection = () => {
  const [confirmText, setConfirmText] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current voting statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-voting-stats"],
    queryFn: async () => {
      const [votesResult, rankingVotesResult, dailyTrackingResult, voteNotesResult] = await Promise.all([
        supabase.from("votes").select("id", { count: "exact", head: true }),
        supabase.from("ranking_votes").select("id", { count: "exact", head: true }),
        supabase.from("daily_vote_tracking").select("id", { count: "exact", head: true }),
        supabase.from("vote_notes").select("id", { count: "exact", head: true }),
      ]);

      return {
        totalVotes: votesResult.count || 0,
        totalRankingVotes: rankingVotesResult.count || 0,
        totalDailyTracking: dailyTrackingResult.count || 0,
        totalVoteNotes: voteNotesResult.count || 0,
      };
    },
  });

  const resetMutation = useMutation<ResetResult>({
    mutationFn: async () => {
      const { data, error } = await supabase.rpc("reset_all_voting_data");
      if (error) throw error;
      return data as unknown as ResetResult;
    },
    onSuccess: (result) => {
      toast({
        title: "Voting Data Reset Complete",
        description: `Successfully reset all voting data. ${result.details.votes_deleted} votes, ${result.details.ranking_votes_deleted} ranking votes, and related data cleared.`,
      });
      
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["admin-voting-stats"] });
      queryClient.invalidateQueries({ queryKey: ["rappers"] });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      
      setIsDialogOpen(false);
      setConfirmText("");
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Reset Failed",
        description: error.message || "Failed to reset voting data. Please try again.",
      });
    },
  });

  const handleReset = () => {
    if (confirmText !== "RESET") {
      toast({
        variant: "destructive",
        title: "Confirmation Required",
        description: "Please type 'RESET' to confirm this action.",
      });
      return;
    }
    resetMutation.mutate();
  };

  const totalRecords = stats ? 
    stats.totalVotes + stats.totalRankingVotes + stats.totalDailyTracking + stats.totalVoteNotes : 0;

  return (
    <Card className="border-destructive/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <Trash2 className="w-5 h-5" />
          Reset Voting Data
        </CardTitle>
        <CardDescription>
          Permanently delete all voting data and reset statistics. This action cannot be undone.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalVotes.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Attribute Votes</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalRankingVotes.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Ranking Votes</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalDailyTracking.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Daily Tracking</div>
          </div>
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-bold text-foreground">
              {statsLoading ? "..." : stats?.totalVoteNotes.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Vote Notes</div>
          </div>
        </div>

        {/* Warning Section */}
        <div className="flex items-start gap-3 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
          <div className="space-y-2">
            <h4 className="font-semibold text-destructive">Danger Zone</h4>
            <p className="text-sm text-muted-foreground">
              This will permanently delete <strong>{totalRecords.toLocaleString()} records</strong> across multiple tables:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>All attribute votes and ranking votes</li>
              <li>Daily vote tracking records</li>
              <li>User vote notes and position history</li>
              <li>Reset rapper statistics (votes and ratings)</li>
              <li>Reset member voting statistics</li>
            </ul>
            <p className="text-sm font-semibold text-destructive">
              This action cannot be undone. All voting history will be lost permanently.
            </p>
          </div>
        </div>

        {/* Reset Button */}
        <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              className="w-full"
              disabled={totalRecords === 0}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset All Voting Data
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Confirm Voting Data Reset
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3">
                  <p>
                    You are about to permanently delete <strong>{totalRecords.toLocaleString()} records</strong> 
                    {" "}and reset all voting-related statistics.
                  </p>
                  <p>This action will:</p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Delete all {stats?.totalVotes.toLocaleString()} attribute votes</li>
                    <li>Delete all {stats?.totalRankingVotes.toLocaleString()} ranking votes</li>
                    <li>Delete all {stats?.totalDailyTracking.toLocaleString()} daily tracking records</li>
                    <li>Delete all {stats?.totalVoteNotes.toLocaleString()} vote notes</li>
                    <li>Reset all rapper voting statistics</li>
                    <li>Reset all member voting statistics</li>
                  </ul>
                  <p className="font-semibold text-destructive">
                    This action cannot be undone!
                  </p>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-input">
                      Type <strong>RESET</strong> to confirm:
                    </Label>
                    <Input
                      id="confirm-input"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      placeholder="Type RESET to confirm"
                      className="font-mono"
                    />
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel 
                onClick={() => {
                  setConfirmText("");
                  setIsDialogOpen(false);
                }}
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleReset}
                disabled={confirmText !== "RESET" || resetMutation.isPending}
                className="bg-destructive hover:bg-destructive/90"
              >
                {resetMutation.isPending ? (
                  <>
                    <RotateCcw className="w-4 h-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset All Data
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
};

export default VotingDataResetSection;