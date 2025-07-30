import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Eye, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import PollDialog from "./PollDialog";
import AdminTabHeader from "./AdminTabHeader";
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
  allow_write_in: boolean;
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
          allow_write_in,
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
      <AdminTabHeader 
        title="Poll Management" 
        icon={BarChart3}
        description="Create and manage community polls and voting"
      >
        <Button 
          onClick={handleCreate}
          className="bg-[var(--theme-primary)] text-[var(--theme-background)] px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Poll
        </Button>
      </AdminTabHeader>

      <div className="grid gap-4">
        {polls?.map((poll) => (
          <Card key={poll.id} className="bg-gradient-to-br from-black via-rap-carbon to-rap-carbon-light border border-rap-smoke/30 rounded-lg hover:border-rap-gold/50 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-lg text-[var(--theme-text)] font-[var(--theme-font-heading)]">{poll.title}</CardTitle>
                  <CardDescription className="text-rap-platinum font-[var(--theme-font-body)]">{poll.description}</CardDescription>
                </div>
                <div className="flex gap-2">
                  {getStatusBadge(poll.status)}
                  {poll.is_featured && <Badge variant="outline" className="border-[var(--theme-primary)] text-[var(--theme-primary)]">Featured</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="font-bold text-base text-[var(--theme-text)] font-[var(--theme-font-heading)] mb-1">Type</p>
                  <p className="text-sm text-rap-platinum font-[var(--theme-font-body)]">
                    {poll.type === 'single_choice' ? 'Single Choice' : 'Multiple Choice'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-[var(--theme-text)] font-[var(--theme-font-heading)] mb-1">Placement</p>
                  <p className="text-sm text-rap-platinum font-[var(--theme-font-body)]">
                    {getPlacementText(poll.placement, poll.blog_post_id)}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-[var(--theme-text)] font-[var(--theme-font-heading)] mb-1">Options</p>
                  <p className="text-sm text-rap-platinum font-[var(--theme-font-body)]">
                    {poll.poll_options.length} options {poll.allow_write_in && '+ write-in'}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-base text-[var(--theme-text)] font-[var(--theme-font-heading)] mb-1">Created</p>
                  <p className="text-sm text-rap-platinum font-[var(--theme-font-body)]">
                    {new Date(poll.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button 
                  size="sm"
                  className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon hover:text-rap-carbon"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Results
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleEdit(poll)}
                  className="bg-white hover:bg-gray-100 text-rap-carbon hover:text-rap-carbon"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDelete(poll.id)}
                  className="bg-red-600 hover:bg-red-700 text-white hover:text-white"
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