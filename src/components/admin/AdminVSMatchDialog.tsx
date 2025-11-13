import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemedInput } from "@/components/ui/themed-input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { VSMatch, CreateVSMatchData, UpdateVSMatchData } from "@/types/vsMatches";
import { Loader2 } from "lucide-react";
import RapperSelector from "./RapperSelector";

interface AdminVSMatchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vsMatch?: VSMatch | null;
  onSubmit: (data: CreateVSMatchData | UpdateVSMatchData) => Promise<void>;
  isSubmitting: boolean;
}

const AdminVSMatchDialog = ({
  open,
  onOpenChange,
  vsMatch,
  onSubmit,
  isSubmitting
}: AdminVSMatchDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rapper1Id, setRapper1Id] = useState("");
  const [rapper2Id, setRapper2Id] = useState("");
  const [status, setStatus] = useState<"draft" | "published" | "archived">("draft");

  // Reset form when dialog opens/closes or vsMatch changes
  useEffect(() => {
    if (open) {
      if (vsMatch) {
        setTitle(vsMatch.title);
        setDescription(vsMatch.description || "");
        setRapper1Id(vsMatch.rapper_1_id);
        setRapper2Id(vsMatch.rapper_2_id);
        setStatus(vsMatch.status as "draft" | "published" | "archived");
      } else {
        setTitle("");
        setDescription("");
        setRapper1Id("");
        setRapper2Id("");
        setStatus("draft");
      }
    }
  }, [open, vsMatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    // Only require rappers for published matches
    if (status === 'published' && (!rapper1Id || !rapper2Id || rapper1Id === rapper2Id)) {
      return;
    }

    const data: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      status
    };

    // Only include rapper IDs if they exist
    if (rapper1Id) data.rapper_1_id = rapper1Id;
    if (rapper2Id) data.rapper_2_id = rapper2Id;

    if (vsMatch) {
      await onSubmit({ ...data, id: vsMatch.id } as UpdateVSMatchData);
    } else {
      await onSubmit(data as CreateVSMatchData);
    }
  };


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-visible bg-[var(--theme-surface)] border border-[var(--theme-border)]">
        <DialogHeader>
          <DialogTitle className="text-[var(--theme-primary)] font-[var(--theme-font-heading)] text-xl">
            {vsMatch ? "Edit VS Match" : "Create VS Match"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[calc(90vh-120px)] overflow-y-auto pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-[var(--theme-text)]">Title</Label>
            <ThemedInput
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kendrick Lamar vs Drake"
              className="admin-themed bg-gray-100 text-rap-carbon border-rap-gold/30 placeholder:text-gray-500"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-[var(--theme-text)]">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this matchup..."
              className="admin-themed bg-gray-100 text-rap-carbon border-rap-gold/30 placeholder:text-gray-500"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <RapperSelector
              label="Rapper 1"
              value={rapper1Id}
              onChange={setRapper1Id}
              excludeIds={rapper2Id ? [rapper2Id] : []}
              placeholder="Select first rapper"
              required={status === 'published'}
            />

            <RapperSelector
              label="Rapper 2"
              value={rapper2Id}
              onChange={setRapper2Id}
              excludeIds={rapper1Id ? [rapper1Id] : []}
              placeholder="Select second rapper"
              required={status === 'published'}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-[var(--theme-text)]">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "published" | "archived")}>
              <SelectTrigger className="admin-themed bg-gray-100 text-rap-carbon border-rap-gold/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-100 border-rap-gold/30 z-50">
                <SelectItem value="draft" className="text-rap-carbon hover:bg-gray-200">Draft</SelectItem>
                <SelectItem value="published" className="text-rap-carbon hover:bg-gray-200">Published</SelectItem>
                <SelectItem value="archived" className="text-rap-carbon hover:bg-gray-200">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || (status === 'published' && (!rapper1Id || !rapper2Id || rapper1Id === rapper2Id))}
              className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primary)]/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vsMatch ? "Update Match" : "Create Match"}
            </Button>
          </div>
        </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVSMatchDialog;