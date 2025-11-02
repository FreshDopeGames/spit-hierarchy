import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Plus, Send, Edit, Trash2, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AnnouncementFormData {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'feature_release' | 'maintenance';
  target_audience: string;
  display_priority: number;
  action_url: string;
  action_text: string;
  expires_at: string;
}

export const AnnouncementManagement = () => {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: '',
    message: '',
    type: 'info',
    target_audience: 'all',
    display_priority: 5,
    action_url: '',
    action_text: '',
    expires_at: '',
  });

  // Fetch announcements
  const { data: announcements } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_announcements')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  // Create announcement mutation
  const createAnnouncement = useMutation({
    mutationFn: async (announcement: any) => {
      const { data, error } = await supabase
        .from('system_announcements')
        .insert([{
          ...announcement,
          expires_at: announcement.expires_at || null
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Broadcast to users
      const { data: broadcastResult, error: broadcastError } = await supabase.rpc('broadcast_system_announcement', {
        announcement_id: data.id
      });
      
      if (broadcastError) {
        console.error('Broadcast error:', broadcastError);
      }
      
      return { data, notificationsSent: broadcastResult };
    },
    onSuccess: (result) => {
      toast.success(`Announcement created and sent to ${result.notificationsSent} users!`);
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      setIsCreating(false);
      resetForm();
    },
    onError: (error) => {
      toast.error('Failed to create announcement');
      console.error(error);
    },
  });

  // Delete announcement mutation
  const deleteAnnouncement = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('system_announcements')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Announcement deleted');
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
    },
  });

  // Toggle active status
  const toggleActive = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const { error } = await supabase
        .from('system_announcements')
        .update({ is_active: !isActive })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      toast.success('Announcement updated');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      target_audience: 'all',
      display_priority: 5,
      action_url: '',
      action_text: '',
      expires_at: '',
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.message) {
      toast.error('Title and message are required');
      return;
    }
    createAnnouncement.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--theme-text))]">System Announcements</h2>
          <p className="text-[hsl(var(--theme-text))]/70 text-sm mt-1">
            Broadcast messages to all users or specific member tiers
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)} variant={isCreating ? 'outline' : 'default'}>
          {isCreating ? 'Cancel' : <><Plus className="w-4 h-4 mr-2" /> Create Announcement</>}
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Announcement</CardTitle>
            <CardDescription>Broadcast a message to your community</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="New Feature Released!"
                  required
                />
              </div>

              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Check out our latest features..."
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type</Label>
                  <Select value={formData.type} onValueChange={(value: any) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="feature_release">Feature Release</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select value={formData.target_audience} onValueChange={(value) => setFormData({ ...formData, target_audience: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Users</SelectItem>
                      <SelectItem value="bronze">Bronze Members</SelectItem>
                      <SelectItem value="silver">Silver Members</SelectItem>
                      <SelectItem value="gold">Gold Members</SelectItem>
                      <SelectItem value="platinum">Platinum Members</SelectItem>
                      <SelectItem value="diamond">Diamond Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="action_url">Action URL (optional)</Label>
                  <Input
                    id="action_url"
                    value={formData.action_url}
                    onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
                    placeholder="/rankings"
                  />
                </div>

                <div>
                  <Label htmlFor="action_text">Action Text (optional)</Label>
                  <Input
                    id="action_text"
                    value={formData.action_text}
                    onChange={(e) => setFormData({ ...formData, action_text: e.target.value })}
                    placeholder="View Rankings"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Display Priority (1-10)</Label>
                  <Input
                    id="priority"
                    type="number"
                    min="1"
                    max="10"
                    value={formData.display_priority}
                    onChange={(e) => setFormData({ ...formData, display_priority: parseInt(e.target.value) })}
                  />
                </div>

                <div>
                  <Label htmlFor="expires_at">Expires At (optional)</Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <Button type="submit" disabled={createAnnouncement.isPending} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                {createAnnouncement.isPending ? 'Broadcasting...' : 'Create & Broadcast'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {announcements?.map(announcement => (
          <Card key={announcement.id} className={!announcement.is_active ? 'opacity-60' : ''}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <span className={`text-xs px-2 py-1 rounded ${
                      announcement.type === 'error' ? 'bg-red-100 text-red-800' :
                      announcement.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      announcement.type === 'success' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {announcement.type}
                    </span>
                  </div>
                  <CardDescription>{announcement.message}</CardDescription>
                  <div className="text-xs text-muted-foreground mt-2 space-y-1">
                    <div>Target: <strong>{announcement.target_audience}</strong></div>
                    <div>Created: {formatDistanceToNow(new Date(announcement.created_at), { addSuffix: true })}</div>
                    {announcement.expires_at && (
                      <div>Expires: {formatDistanceToNow(new Date(announcement.expires_at), { addSuffix: true })}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={announcement.is_active}
                    onCheckedChange={() => toggleActive.mutate({ id: announcement.id, isActive: announcement.is_active })}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteAnnouncement.mutate(announcement.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}

        {announcements?.length === 0 && (
          <div className="text-center py-12 text-[hsl(var(--theme-text))]/60">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No announcements yet. Create your first one above!</p>
          </div>
        )}
      </div>
    </div>
  );
};
