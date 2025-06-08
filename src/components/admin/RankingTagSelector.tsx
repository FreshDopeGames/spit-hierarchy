
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();
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
      toast({
        title: "Success",
        description: "Tag created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create tag",
        variant: "destructive",
      });
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
          <Label className="text-rap-platinum font-kaushan text-sm">
            Selected Tags
          </Label>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTagObjects.map((tag) => (
              <Badge
                key={tag.id}
                variant="outline"
                className="text-rap-platinum border-rap-gold/30 bg-rap-gold/10"
                style={{ borderColor: tag.color }}
              >
                {tag.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-1 h-auto p-0 text-rap-platinum hover:text-red-400"
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
        <Label className="text-rap-platinum font-kaushan text-sm">
          Available Tags
        </Label>
        <div className="flex flex-wrap gap-2 mt-2">
          {availableTags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="cursor-pointer text-rap-platinum border-rap-smoke/30 hover:border-rap-gold/50 hover:bg-rap-gold/10 transition-colors"
              style={{ borderColor: tag.color }}
              onClick={() => handleTagToggle(tag.id)}
            >
              {tag.name}
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
            className="border-rap-gold/30 text-rap-platinum hover:bg-rap-gold/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Tag
          </Button>
        ) : (
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Label className="text-rap-platinum font-kaushan text-sm">
                New Tag Name
              </Label>
              <Input
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                placeholder="Enter tag name"
                className="bg-rap-carbon border-rap-gold/30 text-rap-platinum"
                onKeyPress={(e) => e.key === 'Enter' && handleCreateTag()}
              />
            </div>
            <Button
              onClick={handleCreateTag}
              disabled={!newTagName.trim() || createTagMutation.isPending}
              className="bg-rap-gold text-rap-carbon hover:bg-rap-gold-light"
            >
              Create
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsCreating(false);
                setNewTagName("");
              }}
              className="border-rap-gold/30 text-rap-platinum"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTagSelector;
