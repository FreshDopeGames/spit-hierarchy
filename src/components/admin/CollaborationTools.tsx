import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from "@/components/ui/themed-card";
import { Users, RefreshCw, Link2, Loader2 } from "lucide-react";
import { toast } from "sonner";

const CollaborationTools = () => {
  const [isMatchingArtists, setIsMatchingArtists] = useState(false);
  const [isRefreshingCollaborations, setIsRefreshingCollaborations] = useState(false);
  const [lastMatchCount, setLastMatchCount] = useState<number | null>(null);
  const [lastCollabCount, setLastCollabCount] = useState<number | null>(null);

  const handleMatchArtists = async () => {
    setIsMatchingArtists(true);
    try {
      const { data, error } = await supabase.rpc('match_track_artists_to_rappers');
      
      if (error) throw error;
      
      setLastMatchCount(data);
      toast.success(`Successfully matched ${data} track artists to rappers in our database.`);
    } catch (error) {
      console.error("Error matching artists:", error);
      toast.error("Failed to match artists to rappers.");
    } finally {
      setIsMatchingArtists(false);
    }
  };

  const handleRefreshCollaborations = async () => {
    setIsRefreshingCollaborations(true);
    try {
      const { data, error } = await supabase.rpc('refresh_rapper_collaborations');
      
      if (error) throw error;
      
      setLastCollabCount(data);
      toast.success(`Successfully created/updated ${data} collaboration pairs.`);
    } catch (error) {
      console.error("Error refreshing collaborations:", error);
      toast.error("Failed to refresh collaboration network.");
    } finally {
      setIsRefreshingCollaborations(false);
    }
  };

  return (
    <ThemedCard>
      <ThemedCardHeader>
        <ThemedCardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Collaboration Network Tools
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Manage the rapper collaboration network built from track artist credits.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <ThemedButton
              onClick={handleMatchArtists}
              disabled={isMatchingArtists}
              className="w-full"
            >
              {isMatchingArtists ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Link2 className="mr-2 h-4 w-4" />
              )}
              Match Artists to Rappers
            </ThemedButton>
            {lastMatchCount !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Last run: {lastMatchCount} artists matched
              </p>
            )}
          </div>
          
          <div className="flex-1">
            <ThemedButton
              onClick={handleRefreshCollaborations}
              disabled={isRefreshingCollaborations}
              className="w-full"
            >
              {isRefreshingCollaborations ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Collaboration Network
            </ThemedButton>
            {lastCollabCount !== null && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Last run: {lastCollabCount} collaboration pairs
              </p>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
          <strong>Workflow:</strong>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            <li>Fetch album tracks (captures artist credits from MusicBrainz)</li>
            <li>Match Artists to Rappers (links credits to existing rappers)</li>
            <li>Refresh Collaboration Network (builds pairs from matched credits)</li>
          </ol>
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default CollaborationTools;
