import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAllRappers } from "@/hooks/useAllRappers";
import { VSMatch, CreateVSMatchData, UpdateVSMatchData } from "@/types/vsMatches";
import { Loader2, Search } from "lucide-react";

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
  const [rapperSearch, setRapperSearch] = useState("");

  const { 
    rappersData, 
    isLoading: isLoadingRappers,
    handleSearchInput
  } = useAllRappers({
    itemsPerPage: 100
  });

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

  // Update rapper search when rapperSearch changes
  useEffect(() => {
    handleSearchInput(rapperSearch);
  }, [rapperSearch, handleSearchInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !rapper1Id || !rapper2Id || rapper1Id === rapper2Id) {
      return;
    }

    const data = {
      title: title.trim(),
      description: description.trim() || undefined,
      rapper_1_id: rapper1Id,
      rapper_2_id: rapper2Id,
      status
    };

    if (vsMatch) {
      await onSubmit({ ...data, id: vsMatch.id } as UpdateVSMatchData);
    } else {
      await onSubmit(data as CreateVSMatchData);
    }
  };

  const availableRappers = (rappersData?.rappers || []).filter(rapper => 
    rapper.id !== rapper1Id && rapper.id !== rapper2Id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-black border border-rap-gold/30">
        <DialogHeader>
          <DialogTitle className="text-rap-gold font-ceviche text-xl font-thin">
            {vsMatch ? "Edit VS Match" : "Create VS Match"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-rap-platinum">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Kendrick Lamar vs Drake"
              className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-rap-platinum">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this matchup..."
              className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-rap-platinum">Rapper 1</Label>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-rap-platinum/50" />
                  <Input
                    placeholder="Search rappers..."
                    value={rapperSearch}
                    onChange={(e) => setRapperSearch(e.target.value)}
                    className="pl-10 bg-rap-carbon-light border-rap-gold/30 text-rap-platinum"
                  />
                </div>
                <Select value={rapper1Id} onValueChange={setRapper1Id} required>
                  <SelectTrigger className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum">
                    <SelectValue placeholder="Select first rapper" />
                  </SelectTrigger>
                  <SelectContent className="bg-rap-carbon-light border-rap-gold/30">
                    {isLoadingRappers ? (
                      <SelectItem value="loading" disabled>
                        <Loader2 className="h-4 w-4 animate-spin" />
                      </SelectItem>
                    ) : (
                      availableRappers.map((rapper) => (
                        <SelectItem 
                          key={rapper.id} 
                          value={rapper.id}
                          className="text-rap-platinum hover:bg-rap-gold/10"
                        >
                          {rapper.name}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-rap-platinum">Rapper 2</Label>
              <Select value={rapper2Id} onValueChange={setRapper2Id} required>
                <SelectTrigger className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum">
                  <SelectValue placeholder="Select second rapper" />
                </SelectTrigger>
                <SelectContent className="bg-rap-carbon-light border-rap-gold/30">
                  {isLoadingRappers ? (
                    <SelectItem value="loading" disabled>
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </SelectItem>
                  ) : (
                    availableRappers.map((rapper) => (
                      <SelectItem 
                        key={rapper.id} 
                        value={rapper.id}
                        className="text-rap-platinum hover:bg-rap-gold/10"
                      >
                        {rapper.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-rap-platinum">Status</Label>
            <Select value={status} onValueChange={(value) => setStatus(value as "draft" | "published" | "archived")}>
              <SelectTrigger className="bg-rap-carbon-light border-rap-gold/30 text-rap-platinum">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-rap-carbon-light border-rap-gold/30">
                <SelectItem value="draft" className="text-rap-platinum">Draft</SelectItem>
                <SelectItem value="published" className="text-rap-platinum">Published</SelectItem>
                <SelectItem value="archived" className="text-rap-platinum">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-rap-gold/30 text-rap-gold hover:bg-rap-gold/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title.trim() || !rapper1Id || !rapper2Id || rapper1Id === rapper2Id}
              className="bg-rap-gold text-rap-carbon hover:bg-rap-gold/90"
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {vsMatch ? "Update Match" : "Create Match"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVSMatchDialog;