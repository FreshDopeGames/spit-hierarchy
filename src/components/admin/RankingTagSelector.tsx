
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { toast } from "sonner";

interface RankingTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface RankingTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const RankingTagSelector = ({ selectedTags, onTagsChange }: RankingTagSelectorProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: allTags = [] } = useQuery({
    queryKey: ["ranking-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ranking_tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as RankingTag[];
    }
  });

  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const colors = ['#DC2626', '#7C3AED', '#059669', '#EA580C', '#0891B2', '#BE185D'];
      const color = colors[Math.floor(Math.random() * colors.length)];

      const { data, error } = await supabase
        .from("ranking_tags")
        .insert({ name, slug, color })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["ranking-tags"] });
      onTagsChange([...selectedTags, newTag.id]);
      setNewTagName("");
      setIsCreating(false);
      toast.success("Tag created successfully");
    },
    onError: (error) => {
      toast.error("Failed to create tag");
      console.error("Error creating tag:", error);
    }
  });

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCreateTag = () => {
    if (newTagName.trim()) {
      createTagMutation.mutate(newTagName.trim());
    }
  };

  const selectedTagObjects = allTags.filter(tag => selectedTags.includes(tag.id));
  const availableTags = allTags.filter(tag => !selectedTags.includes(tag.id));

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTagObjects.length > 0 && (
        <div>
          <Label className="text-[var(--theme-text)] font-[var(--theme-font-heading)] text-sm">
            Selected Tags
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTagObjects.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-[var(--theme-text)] border-[var(--theme-primary)]/30 bg-[var(--theme-primary)]/10 text-xs sm:text-sm h-8 sm:h-6 px-2 sm:px-3"
                style={{ borderColor: tag.color }}
              >
                <span className="truncate max-w-[120px] sm:max-w-none">{tag.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-[var(--theme-text)] hover:text-[var(--theme-destructive)] min-w-[16px]"
                  onClick={() => handleTagToggle(tag.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      <div>
        <Label className="text-[var(--theme-text)] font-[var(--theme-font-heading)] text-sm">
          Available Tags
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer text-[var(--theme-text)] border-[var(--theme-border)] hover:border-[var(--theme-primary)]/50 hover:bg-[var(--theme-primary)]/10 transition-colors text-xs sm:text-sm h-8 sm:h-6 px-2 sm:px-3"
              style={{ borderColor: tag.color }}
              onClick={() => handleTagToggle(tag.id)}
            >
              <span className="truncate max-w-[120px] sm:max-w-none">{tag.name}</span>
            </Badge>
          ))}
        </div>
      </div>

      {/* Create New Tag */}
      <div>
        {!isCreating ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="border-[var(--theme-border)] text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20 h-10 sm:h-9 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Tag
          </Button>
        ) : (
          <div className="space-y-3">
            <div>
              <Label className="text-[var(--theme-text)] font-[var(--theme-font-heading)] text-sm">
                New Tag Name
              </Label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="bg-[var(--theme-background)] border-[var(--theme-border)] text-[var(--theme-text)] h-11 sm:h-10 mt-1"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCreateTag}
                disabled={!newTagName.trim() || createTagMutation.isPending}
                className="bg-[var(--theme-primary)] text-[var(--theme-background)] hover:bg-[var(--theme-primary)]/90 h-10 flex-1 sm:flex-none"
              >
                Create
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setNewTagName("");
                }}
                className="border-[var(--theme-border)] text-[var(--theme-text)] h-10 flex-1 sm:flex-none"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTagSelector;
