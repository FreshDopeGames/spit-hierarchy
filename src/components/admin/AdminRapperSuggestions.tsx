import { useState } from "react";
import { useAdminSuggestions, useUpdateSuggestionStatus } from "@/hooks/useRapperSuggestions";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
import { ThemedButton } from "@/components/ui/themed-button";
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { ThemedLabel } from "@/components/ui/themed-label";
import { ThemedTextarea } from "@/components/ui/themed-textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Check, X, Eye } from "lucide-react";
import type { RapperSuggestionWithUser } from "@/types/rapperSuggestion";

const AdminRapperSuggestions = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSuggestion, setSelectedSuggestion] = useState<RapperSuggestionWithUser | null>(null);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");
  
  const { isAdmin } = useSecurityContext();
  const { data: suggestions = [], isLoading } = useAdminSuggestions(statusFilter);
  const updateStatus = useUpdateSuggestionStatus();

  const handleApprove = async (id: string) => {
    await updateStatus.mutateAsync({
      id,
      status: "approved",
      admin_notes: "Rapper added to database",
    });
  };

  const handleReject = async () => {
    if (!selectedSuggestion) return;
    
    await updateStatus.mutateAsync({
      id: selectedSuggestion.id,
      status: "rejected",
      admin_notes: adminNotes || "Not suitable for addition",
    });
    
    setRejectDialogOpen(false);
    setSelectedSuggestion(null);
    setAdminNotes("");
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      pending: "secondary",
      approved: "default",
      rejected: "destructive",
    };
    
    return (
      <Badge variant={variants[status] || "default"} className="capitalize">
        {status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-[hsl(var(--theme-text-muted))]">Loading suggestions...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            Rapper Suggestions
          </h2>
          <p className="text-[hsl(var(--theme-text-muted))] mt-1">
            Review member suggestions for new rappers to add
          </p>
        </div>
        
        <div className="w-48">
          <ThemedSelect value={statusFilter} onValueChange={setStatusFilter}>
            <ThemedSelectTrigger>
              <ThemedSelectValue placeholder="Filter by status" />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              <ThemedSelectItem value="all">All Suggestions</ThemedSelectItem>
              <ThemedSelectItem value="pending">Pending</ThemedSelectItem>
              <ThemedSelectItem value="approved">Approved</ThemedSelectItem>
              <ThemedSelectItem value="rejected">Rejected</ThemedSelectItem>
            </ThemedSelectContent>
          </ThemedSelect>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <ThemedCard>
          <ThemedCardContent className="py-12 text-center">
            <p className="text-[hsl(var(--theme-text-muted))]">
              No suggestions found for the selected filter.
            </p>
          </ThemedCardContent>
        </ThemedCard>
      ) : (
        <ThemedCard>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rapper Name</TableHead>
                  {isAdmin && <TableHead>Submitted By</TableHead>}
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suggestions.map((suggestion) => (
                  <TableRow key={suggestion.id}>
                    <TableCell className="font-medium">
                      {suggestion.rapper_name}
                    </TableCell>
                    {isAdmin && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={suggestion.avatar_url} />
                            <AvatarFallback>
                              {(suggestion.username?.[0] || suggestion.user_id?.[0] || "?").toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{suggestion.username || suggestion.user_id?.slice(0, 8) || "Unknown"}</span>
                        </div>
                      </TableCell>
                    )}
                    <TableCell>{getStatusBadge(suggestion.status)}</TableCell>
                    <TableCell className="text-sm text-[hsl(var(--theme-text-muted))]">
                      {formatDistanceToNow(new Date(suggestion.created_at), {
                        addSuffix: true,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <ThemedButton
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedSuggestion(suggestion)}
                        >
                          <Eye className="h-4 w-4" />
                        </ThemedButton>
                        
                        {suggestion.status === "pending" && (
                          <>
                            <ThemedButton
                              variant="default"
                              size="sm"
                              onClick={() => handleApprove(suggestion.id)}
                              disabled={updateStatus.isPending}
                            >
                              <Check className="h-4 w-4" />
                            </ThemedButton>
                            <ThemedButton
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedSuggestion(suggestion);
                                setRejectDialogOpen(true);
                              }}
                              disabled={updateStatus.isPending}
                            >
                              <X className="h-4 w-4" />
                            </ThemedButton>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ThemedCard>
      )}

      {/* View Details Dialog */}
      <Dialog open={!!selectedSuggestion && !rejectDialogOpen} onOpenChange={() => setSelectedSuggestion(null)}>
        <DialogContent className="bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-primary))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--theme-primary))]">Suggestion Details</DialogTitle>
          </DialogHeader>
          {selectedSuggestion && (
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-[hsl(var(--theme-text-muted))]">Rapper Name</p>
                <p className="text-lg font-semibold text-[hsl(var(--theme-text))]">
                  {selectedSuggestion.rapper_name}
                </p>
              </div>
              
              {selectedSuggestion.additional_info && (
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--theme-text-muted))]">
                    Additional Information
                  </p>
                  <p className="text-[hsl(var(--theme-text))] whitespace-pre-wrap">
                    {selectedSuggestion.additional_info}
                  </p>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-[hsl(var(--theme-text-muted))]">Status</p>
                {getStatusBadge(selectedSuggestion.status)}
              </div>
              
              {selectedSuggestion.admin_notes && (
                <div>
                  <p className="text-sm font-medium text-[hsl(var(--theme-text-muted))]">Admin Notes</p>
                  <p className="text-[hsl(var(--theme-text))]">{selectedSuggestion.admin_notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-primary))]">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--theme-primary))]">Reject Suggestion</DialogTitle>
            <DialogDescription className="text-[hsl(var(--theme-text-muted))]">
              Please provide a reason for rejecting this suggestion.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <ThemedLabel htmlFor="admin_notes">Admin Notes</ThemedLabel>
              <ThemedTextarea
                id="admin_notes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Explain why this suggestion is being rejected..."
                className="mt-1 min-h-[100px]"
              />
            </div>
            <div className="flex justify-end gap-3">
              <ThemedButton
                variant="outline"
                onClick={() => {
                  setRejectDialogOpen(false);
                  setAdminNotes("");
                }}
              >
                Cancel
              </ThemedButton>
              <ThemedButton
                variant="destructive"
                onClick={handleReject}
                disabled={updateStatus.isPending}
              >
                {updateStatus.isPending ? "Rejecting..." : "Reject Suggestion"}
              </ThemedButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminRapperSuggestions;
