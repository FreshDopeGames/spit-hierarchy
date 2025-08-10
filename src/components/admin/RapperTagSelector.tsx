import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface RapperTag {
  id: string;
  name: string;
  slug: string;
  color: string;
}

interface RapperTagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tagIds: string[]) => void;
}

const RapperTagSelector = ({ selectedTags, onTagsChange }: RapperTagSelectorProps) => {
  const [newTagName, setNewTagName] = useState("");
  const [isCreatingNewTag, setIsCreatingNewTag] = useState(false);
  const queryClient = useQueryClient();

  // Fetch all rapper tags
  const { data: allTags = [] } = useQuery({
    queryKey: ["rapper-tags"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rapper_tags")
        .select("*")
        .order("name");
      
      if (error) throw error;
      return data as RapperTag[];
    },
  });

  // Create new tag mutation
  const createTagMutation = useMutation({
    mutationFn: async (name: string) => {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const colors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const { data, error } = await supabase
        .from("rapper_tags")
        .insert([{ name, slug, color: randomColor }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (newTag) => {
      queryClient.invalidateQueries({ queryKey: ["rapper-tags"] });
      onTagsChange([...selectedTags, newTag.id]);
      setNewTagName("");
      setIsCreatingNewTag(false);
      toast.success("Tag created successfully!");
    },
    onError: (error) => {
      console.error("Error creating tag:", error);
      toast.error("Failed to create tag");
    },
  });

  const handleTagToggle = (tagId: string) => {
    if (selectedTags.includes(tagId)) {
      onTagsChange(selectedTags.filter(id => id !== tagId));
    } else {
      onTagsChange([...selectedTags, tagId]);
    }
  };

  const handleCreateTag = () => {
    if (!newTagName.trim()) return;
    createTagMutation.mutate(newTagName.trim());
  };

  const selectedTagsData = allTags.filter(tag => selectedTags.includes(tag.id));
  const availableTags = allTags.filter(tag => !selectedTags.includes(tag.id));

  return (
    <div className="space-y-4">
      {/* Selected Tags */}
      {selectedTagsData.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Selected Tags</h4>
          <div className="flex flex-wrap gap-2">
            {selectedTagsData.map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="cursor-pointer hover:opacity-75"
                style={{ backgroundColor: tag.color, color: 'white' }}
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name} ×
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Available Tags */}
      {availableTags.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2">Available Tags</h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleTagToggle(tag.id)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Create New Tag */}
      <div>
        <h4 className="text-sm font-medium text-muted-foreground mb-2">Create New Tag</h4>
        {!isCreatingNewTag ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCreatingNewTag(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add New Tag
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter tag name"
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateTag();
                } else if (e.key === 'Escape') {
                  setIsCreatingNewTag(false);
                  setNewTagName("");
                }
              }}
              className="flex-1"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTagMutation.isPending}
            >
              Create
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreatingNewTag(false);
                setNewTagName("");
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RapperTagSelector;