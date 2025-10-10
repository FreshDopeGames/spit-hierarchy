import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedLabel } from '@/components/ui/themed-label';
import { useUsernameUpdate } from '@/hooks/useUsernameUpdate';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface UsernameEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentUsername: string;
  userId: string;
}

export const UsernameEditDialog = ({ 
  open, 
  onOpenChange, 
  currentUsername,
  userId 
}: UsernameEditDialogProps) => {
  const [newUsername, setNewUsername] = useState(currentUsername);
  const [canChange, setCanChange] = useState(true);
  const [validationError, setValidationError] = useState<string | null>(null);
  const { updateUsername, checkCanChange, isUpdating } = useUsernameUpdate();

  useEffect(() => {
    if (open) {
      setNewUsername(currentUsername);
      checkEligibility();
    }
  }, [open, currentUsername]);

  const checkEligibility = async () => {
    const eligible = await checkCanChange(userId);
    setCanChange(eligible);
  };

  const validateUsername = (username: string): string | null => {
    if (username.length < 3) {
      return 'Username must be at least 3 characters long';
    }
    if (username.length > 30) {
      return 'Username must be 30 characters or less';
    }
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      return 'Username can only contain letters, numbers, underscores, and hyphens';
    }
    return null;
  };

  const handleUsernameChange = (value: string) => {
    setNewUsername(value);
    const error = validateUsername(value);
    setValidationError(error);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validationError || newUsername === currentUsername) {
      return;
    }

    const result = await updateUsername(newUsername);
    
    if (result.success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Username</DialogTitle>
          <DialogDescription>
            {canChange 
              ? 'Change your username. You can do this once every 60 days.'
              : 'You cannot change your username yet. Please check back later.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <ThemedLabel htmlFor="username">
                Username
              </ThemedLabel>
              <ThemedInput
                id="username"
                value={newUsername}
                onChange={(e) => handleUsernameChange(e.target.value)}
                disabled={!canChange || isUpdating}
                placeholder="Enter new username"
                autoComplete="off"
              />
              
              {validationError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertCircle className="w-4 h-4" />
                  <span>{validationError}</span>
                </div>
              )}
              
              {!validationError && newUsername !== currentUsername && newUsername.length >= 3 && (
                <div className="flex items-center gap-2 text-sm text-success">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Username is valid</span>
                </div>
              )}
            </div>
            
            {!canChange && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  You need to wait 60 days between username changes to prevent abuse.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <ThemedButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isUpdating}
            >
              Cancel
            </ThemedButton>
            <ThemedButton
              type="submit"
              disabled={
                !canChange || 
                isUpdating || 
                !!validationError || 
                newUsername === currentUsername
              }
            >
              {isUpdating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Changes'
              )}
            </ThemedButton>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
