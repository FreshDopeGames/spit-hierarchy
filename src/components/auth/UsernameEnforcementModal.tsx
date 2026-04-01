import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemedInput } from "@/components/ui/themed-input";
import { Check, AlertCircle, User, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const UsernameEnforcementModal = () => {
  const { needsUsername } = useUsernameCheck();
  const queryClient = useQueryClient();
  const [username, setUsername] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [status, setStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (!username.trim() || username.length < 3) {
        setStatus('idle');
        return;
      }
      if (!/^[a-zA-Z0-9_-]+$/.test(username) || username.length > 30) {
        setStatus('invalid');
        return;
      }
      setIsChecking(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .maybeSingle();
        if (error) throw error;
        setStatus(data ? 'taken' : 'available');
      } catch {
        setStatus('invalid');
      } finally {
        setIsChecking(false);
      }
    };
    const t = setTimeout(check, 500);
    return () => clearTimeout(t);
  }, [username]);

  const handleSave = async () => {
    if (status !== 'available') return;
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      // Try update first (profile likely exists from trigger), fall back to upsert
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', user.id);
      
      if (updateError) {
        // If update fails (no row yet), try insert
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({ id: user.id, username: username.trim() });
        if (insertError) throw insertError;
      }
      
      if (upsertError) throw upsertError;

      // Dismiss the modal immediately on success
      setDismissed(true);
      toast.success("Username saved!");

      // Invalidate queries in background so the rest of the app picks up the new username
      queryClient.invalidateQueries({ queryKey: ['username-check'] });
      queryClient.invalidateQueries({ queryKey: ['own-profile'] });
      queryClient.invalidateQueries({ queryKey: ['public-profile-minimal'] });
      queryClient.invalidateQueries({ queryKey: ['profile-for-display'] });
    } catch {
      toast.error("Failed to save username. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!needsUsername || dismissed) return null;

  const statusIcon = () => {
    if (isChecking) return <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />;
    if (status === 'available') return <Check className="w-5 h-5 text-green-500" />;
    if (status === 'taken' || status === 'invalid') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  const statusMsg = () => {
    if (status === 'available') return "Username is available!";
    if (status === 'taken') return "Username is already taken";
    if (status === 'invalid') return "3-30 characters, letters, numbers, _ and - only";
    return "Choose a unique username that represents you";
  };

  const statusColor = () => {
    if (status === 'available') return 'hsl(var(--theme-success, 120 60% 50%))';
    if (status === 'taken' || status === 'invalid') return 'hsl(var(--theme-error, 0 60% 50%))';
    return 'hsl(var(--theme-textMuted))';
  };

  return (
    <Dialog open={true} onOpenChange={() => {}}>
      <DialogContent
        className="max-w-[95vw] sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        style={{
          backgroundColor: 'hsl(var(--theme-surface))',
          border: '2px solid hsl(var(--theme-primary))',
          borderRadius: '12px'
        }}
      >
        <div
          className="p-6 sm:p-8 text-center"
          style={{
            background: 'linear-gradient(135deg, hsl(var(--theme-surface)) 0%, hsl(var(--theme-surfaceSecondary)) 100%)'
          }}
        >
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'hsl(var(--theme-primary))' }}
          >
            <User className="w-10 h-10" style={{ color: 'hsl(var(--theme-textLight))' }} />
          </div>

          <h2
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ color: 'hsl(var(--theme-text))', fontFamily: 'var(--theme-font-heading)' }}
          >
            Choose Your Username
          </h2>
          <p
            className="text-sm mb-6"
            style={{ color: 'hsl(var(--theme-textMuted))' }}
          >
            Pick a name that represents your style. This keeps your identity anonymous while you rep your favorites.
          </p>

          <div className="max-w-sm mx-auto mb-6">
            <div className="relative mb-2">
              <ThemedInput
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="text-center text-xl font-bold h-14 px-6"
                style={{ fontFamily: 'var(--theme-font-heading)', fontSize: '1.25rem', fontWeight: '700' }}
                maxLength={30}
                disabled={isSaving}
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                {statusIcon()}
              </div>
            </div>
            <p className="text-sm" style={{ color: statusColor() }}>
              {statusMsg()}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={status !== 'available' || isSaving}
            style={{
              backgroundColor: status === 'available' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-surfaceSecondary))',
              color: status === 'available' ? 'hsl(var(--theme-textLight))' : 'hsl(var(--theme-textMuted))'
            }}
            className="px-8 py-3 text-lg hover:opacity-90 disabled:hover:opacity-100"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </span>
            ) : "Continue"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UsernameEnforcementModal;
