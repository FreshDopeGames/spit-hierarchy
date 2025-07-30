import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PollDialog from "./PollDialog";
import { toast } from "sonner";

interface Poll {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  placement: string;
  blog_post_id?: string;
  expires_at?: string;
  is_featured: boolean;
  created_at: string;
  poll_options: Array<{
    id: string;
    option_text: string;
    option_order: number;
  }>;
}

const PollManagement = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPoll, setEditingPoll] = useState<Poll | null>(null);

  const { data: polls, isLoading, refetch } = useQuery({
    queryKey: ['admin-polls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('polls')
        .select(`
          id,
          title,
          description,
          type,
          status,
          placement,
          blog_post_id,
          expires_at,
          is_featured,
          created_at,
          poll_options (
            id,
            option_text,
            option_order
          )
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Poll[];
    }
  });

  const handleDelete = async (pollId: string) => {
    if (!confirm('Are you sure you want to delete this poll?')) return;

    const { error } = await supabase
      .from('polls')
      .delete()
      .eq('id', pollId);

    if (error) {
      toast.error('Failed to delete poll');
    } else {
      toast.success('Poll deleted successfully');
      refetch();
    }
  };

  const handleEdit = (poll: Poll) => {
    setEditingPoll(poll);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingPoll(null);
    setIsDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      completed: 'outline',
      archived: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status}
      </Badge>
    );
  };

  const getPlacementText = (placement: string, blogPostId?: string) => {
    switch (placement) {
      case 'homepage': return 'Homepage';
      case 'all_blogs': return 'All Blog Posts';
      case 'specific_blog': return `Specific Blog (${blogPostId})`;
      default: return placement;
    }
  };

  if (isLoading) {
    return <div>Loading polls...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Poll Management</h2>
          <p className="text-muted-foreground">Create and manage community polls</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </div>

      <div className="grid gap-4">
        {polls?.map((poll) => (
          <Card key={poll.id}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{poll.title}</CardTitle>
                  <CardDescription>{poll.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(poll.status)}
                  {poll.is_featured && <Badge variant="outline">Featured</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <p className="font-medium">Type</p>
                  <p className="text-muted-foreground">
                    {poll.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Placement</p>
                  <p className="text-muted-foreground">
                    {getPlacementText(poll.placement, poll.blog_post_id)}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Options</p>
                  <p className="text-muted-foreground">{poll.poll_options.length} options</p>
                </div>
                <div>
                  <p className="font-medium">Created</p>
                  <p className="text-muted-foreground">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View Results
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEdit(poll)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDelete(poll.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <PollDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        poll={editingPoll}
        onSuccess={() => {
          refetch();
          setIsDialogOpen(false);
          setEditingPoll(null);
        }}
      />
    </div>
  );
};

export default PollManagement;