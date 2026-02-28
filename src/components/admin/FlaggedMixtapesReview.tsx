import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Flag, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import AdminTabHeader from "./AdminTabHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface FlaggedAlbum {
  album_id: string;
  album_title: string;
  release_type: string;
  release_date: string | null;
  flag_reason: string | null;
  rapper_name: string;
  rapper_id: string;
}

const FlaggedMixtapesReview = () => {
  const queryClient = useQueryClient();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  const { data: flaggedAlbums, isLoading } = useQuery({
    queryKey: ["flagged-mixtapes"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_albums")
        .select(`
          rapper_id,
          album_id,
          rappers!inner ( name ),
          albums!inner (
            id, title, release_type, release_date,
            is_flagged_unofficial, unofficial_flag_reason
          )
        `)
        .eq("albums.is_flagged_unofficial", true)
        .order("album_id");

      if (error) throw error;

      // Deduplicate by album_id, collect rapper names
      const albumMap = new Map<string, FlaggedAlbum>();
      for (const row of data || []) {
        const album = row.albums as any;
        const rapper = row.rappers as any;
        const existing = albumMap.get(album.id);
        if (existing) {
          existing.rapper_name += `, ${rapper.name}`;
        } else {
          albumMap.set(album.id, {
            album_id: album.id,
            album_title: album.title,
            release_type: album.release_type,
            release_date: album.release_date,
            flag_reason: album.unofficial_flag_reason,
            rapper_name: rapper.name,
            rapper_id: row.rapper_id,
          });
        }
      }
      return Array.from(albumMap.values()).sort((a, b) =>
        a.rapper_name.localeCompare(b.rapper_name)
      );
    },
  });

  const unflagMutation = useMutation({
    mutationFn: async (albumId: string) => {
      const { error } = await supabase
        .from("albums")
        .update({
          is_flagged_unofficial: false,
          unofficial_flag_reason: null,
        })
        .eq("id", albumId);
      if (error) throw error;
    },
    onSuccess: (_, albumId) => {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(albumId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["flagged-mixtapes"] });
      toast.success("Album restored to discography");
    },
    onError: (err) => toast.error(`Failed to unflag: ${err.message}`),
  });

  const deleteMutation = useMutation({
    mutationFn: async (albumId: string) => {
      // Remove rapper_albums links first, then album
      const { error: linkError } = await supabase
        .from("rapper_albums")
        .delete()
        .eq("album_id", albumId);
      if (linkError) throw linkError;

      const { error: trackError } = await supabase
        .from("album_tracks")
        .delete()
        .eq("album_id", albumId);
      if (trackError) throw trackError;

      const { error } = await supabase
        .from("albums")
        .delete()
        .eq("id", albumId);
      if (error) throw error;
    },
    onSuccess: (_, albumId) => {
      setProcessingIds((prev) => {
        const next = new Set(prev);
        next.delete(albumId);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["flagged-mixtapes"] });
      toast.success("Album permanently deleted");
    },
    onError: (err) => toast.error(`Failed to delete: ${err.message}`),
  });

  const handleAction = (albumId: string, action: "unflag" | "delete") => {
    setProcessingIds((prev) => new Set(prev).add(albumId));
    if (action === "unflag") {
      unflagMutation.mutate(albumId);
    } else {
      deleteMutation.mutate(albumId);
    }
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Flagged Mixtapes Review"
        icon={Flag}
        description="Review mixtapes flagged as unofficial or unauthorized. Restore legitimate releases or permanently delete bootlegs."
      />

      <Card className="bg-[hsl(var(--theme-surface))] border border-[hsl(var(--theme-border))]">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[hsl(var(--theme-primary))]" />
            </div>
          ) : !flaggedAlbums?.length ? (
            <div className="flex flex-col items-center justify-center p-12 text-[hsl(var(--theme-text-secondary))]">
              <CheckCircle className="h-12 w-12 mb-3 text-green-500" />
              <p className="text-lg font-semibold">No flagged mixtapes</p>
              <p className="text-sm">All mixtapes have been reviewed.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-[hsl(var(--theme-border))]">
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold">Artist</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold">Title</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold hidden sm:table-cell">Type</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold hidden md:table-cell">Date</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold hidden lg:table-cell">Flag Reason</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))] font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {flaggedAlbums.map((album) => {
                    const isProcessing = processingIds.has(album.album_id);
                    return (
                      <TableRow
                        key={album.album_id}
                        className="border-[hsl(var(--theme-border))] hover:bg-[hsl(var(--theme-surface-hover))]"
                      >
                        <TableCell className="text-[hsl(var(--theme-text))] font-medium">
                          {album.rapper_name}
                        </TableCell>
                        <TableCell className="text-[hsl(var(--theme-text))]">
                          {album.album_title}
                        </TableCell>
                        <TableCell className="text-[hsl(var(--theme-text-secondary))] capitalize hidden sm:table-cell">
                          {album.release_type}
                        </TableCell>
                        <TableCell className="text-[hsl(var(--theme-text-secondary))] hidden md:table-cell">
                          {album.release_date || "—"}
                        </TableCell>
                        <TableCell className="text-[hsl(var(--theme-text-secondary))] text-xs hidden lg:table-cell max-w-[200px] truncate">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3 text-yellow-500 flex-shrink-0" />
                            {album.flag_reason || "No reason given"}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={isProcessing}
                              onClick={() => handleAction(album.album_id, "unflag")}
                              className="border-green-600 text-green-500 hover:bg-green-600/20 text-xs"
                            >
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Restore
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              disabled={isProcessing}
                              onClick={() => handleAction(album.album_id, "delete")}
                              className="text-xs"
                            >
                              <XCircle className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {flaggedAlbums && flaggedAlbums.length > 0 && (
        <p className="text-xs text-[hsl(var(--theme-text-secondary))]">
          {flaggedAlbums.length} flagged item{flaggedAlbums.length !== 1 ? "s" : ""} pending review
        </p>
      )}
    </div>
  );
};

export default FlaggedMixtapesReview;
