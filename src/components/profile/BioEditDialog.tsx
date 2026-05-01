import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThemedTextarea } from '@/components/ui/themed-textarea';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedLabel } from '@/components/ui/themed-label';
import { Loader2, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import DOMPurify from 'dompurify';

interface BioEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentBio: string;
  userId: string;
}

const MAX_LENGTH = 200;

export const BioEditDialog = ({
  open,
  onOpenChange,
  currentBio,
  userId,
}: BioEditDialogProps) => {
  const [bio, setBio] = useState(currentBio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setBio(currentBio || '');
      setError(null);
    }
  }, [open, currentBio]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmed = bio.trim();
    if (trimmed.length > MAX_LENGTH) {
      setError(`Tagline must be ${MAX_LENGTH} characters or less`);
      return;
    }

    // Sanitize to prevent any HTML/script injection
    const cleaned = DOMPurify.sanitize(trimmed, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

    setIsSaving(true);
    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({ bio: cleaned || null })
        .eq('id', userId)
        .select('id');

      if (updateError) throw updateError;
      if (!data || data.length === 0) {
        throw new Error('Update failed — no rows changed.');
      }

      await queryClient.invalidateQueries({ queryKey: ['user-profile', userId] });
      await queryClient.invalidateQueries({ queryKey: ['own-profile'] });

      toast({ title: 'Tagline updated', description: 'Your tagline has been saved.' });
      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update tagline');
    } finally {
      setIsSaving(false);
    }
  };

  const remaining = MAX_LENGTH - bio.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Edit Tagline</DialogTitle>
          <DialogDescription>
            A short tagline shown on your profile. Up to {MAX_LENGTH} characters.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <ThemedLabel htmlFor="bio">Tagline</ThemedLabel>
              <ThemedTextarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                disabled={isSaving}
                placeholder="Say something about yourself..."
                rows={4}
                maxLength={MAX_LENGTH}
              />
              <div className={`text-xs text-right ${remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                {remaining} characters remaining
              </div>

              {error && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <ThemedButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </ThemedButton>
            <ThemedButton type="submit" disabled={isSaving || bio === (currentBio || '')}>
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Tagline'
              )}
            </ThemedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
