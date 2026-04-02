import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemedInput } from "@/components/ui/themed-input";
import { X, Trophy, Users, Star, User, Check, AlertCircle } from "lucide-react";
import { useUsernameCheck } from "@/hooks/useUsernameCheck";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const { needsUsername } = useUsernameCheck();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Username validation
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim() || username.length < 3) {
        setUsernameStatus('idle');
        return;
      }

      const usernameRegex = /^[a-zA-Z0-9_-]+$/;
      if (!usernameRegex.test(username) || username.length > 30) {
        setUsernameStatus('invalid');
        return;
      }

      setIsCheckingUsername(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .maybeSingle();

        if (error) throw error;
        setUsernameStatus(data ? 'taken' : 'available');
      } catch (error) {
        console.error('Error checking username:', error);
        setUsernameStatus('invalid');
      } finally {
        setIsCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(checkUsername, 500);
    return () => clearTimeout(timeoutId);
  }, [username]);

  const handleSaveUsername = async () => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase.rpc('save_onboarding_username', {
        p_username: username.trim(),
      });

      if (error) throw error;

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['username-check'] }),
        queryClient.invalidateQueries({ queryKey: ['own-profile'] }),
        queryClient.invalidateQueries({ queryKey: ['onboarding-status'] }),
        queryClient.invalidateQueries({ queryKey: ['member-stats'] }),
      ]);

      toast.success("Welcome to Spit Hierarchy! 🎤");
      onComplete();
    } catch (error: any) {
      console.error('Onboarding error:', error);
      toast.error(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  // Step 1: Welcome
  if (currentStep === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden"
          style={{
            backgroundColor: 'hsl(var(--theme-surface))',
            border: '2px solid hsl(var(--theme-primary))',
            borderRadius: '12px'
          }}
        >
          <div className="relative">
            <button
              onClick={handleSkip}
              className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors hover:bg-black/20"
              style={{ color: 'hsl(var(--theme-textMuted))' }}
            >
              <X className="w-5 h-5" />
            </button>

            <div 
              className="p-4 sm:p-6 md:p-8 text-center"
              style={{
                background: 'linear-gradient(135deg, hsl(var(--theme-surface)) 0%, hsl(var(--theme-surfaceSecondary)) 100%)'
              }}
            >
              <div className="mb-6">
                <div 
                  className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'hsl(var(--theme-primary))' }}
                >
                  <Trophy className="w-10 h-10" style={{ color: 'hsl(var(--theme-textLight))' }} />
                </div>
                <h2 
                  className="text-2xl sm:text-3xl font-bold mb-4"
                  style={{ 
                    color: 'hsl(var(--theme-text))',
                    fontFamily: 'var(--theme-font-heading)'
                  }}
                >
                  Welcome to Spit Hierarchy!
                </h2>
                <p 
                  className="text-lg mb-6"
                  style={{ color: 'hsl(var(--theme-textMuted))' }}
                >
                  Let's get you started by choosing a username. This helps us personalize your experience and connect you with the community.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'hsl(var(--theme-accent))' }}
                  >
                    <Star className="w-6 h-6" style={{ color: 'hsl(var(--theme-textLight))' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--theme-text))' }}>
                    Personalized Rankings
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--theme-textMuted))' }}>
                    See how your favorites rank against the community
                  </p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'hsl(var(--theme-accent))' }}
                  >
                    <Users className="w-6 h-6" style={{ color: 'hsl(var(--theme-textLight))' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--theme-text))' }}>
                    Community Connection
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--theme-textMuted))' }}>
                    Find users with similar taste in hip-hop
                  </p>
                </div>
                <div className="text-center">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
                    style={{ backgroundColor: 'hsl(var(--theme-accent))' }}
                  >
                    <Trophy className="w-6 h-6" style={{ color: 'hsl(var(--theme-textLight))' }} />
                  </div>
                  <h3 className="font-semibold mb-2" style={{ color: 'hsl(var(--theme-text))' }}>
                    Better Recommendations
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--theme-textMuted))' }}>
                    Discover new artists based on your preferences
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    backgroundColor: 'hsl(var(--theme-primary))',
                    color: 'hsl(var(--theme-textLight))'
                  }}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:opacity-90"
                >
                  Get Started
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  style={{
                    borderColor: 'hsl(var(--theme-border))',
                    color: 'hsl(var(--theme-textMuted))'
                  }}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:bg-black/5"
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Step 2: Username Creation (final step)
  const getUsernameStatusIcon = () => {
    if (isCheckingUsername) return <div className="animate-spin w-5 h-5 border-2 border-current border-t-transparent rounded-full" />;
    if (usernameStatus === 'available') return <Check className="w-5 h-5 text-green-500" />;
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return null;
  };

  const getUsernameStatusMessage = () => {
    if (usernameStatus === 'available') return "Username is available!";
    if (usernameStatus === 'taken') return "Username is already taken";
    if (usernameStatus === 'invalid') return "Username must be 3-30 characters, letters, numbers, _ and - only";
    return "Choose a unique username that represents you";
  };

  const getUsernameStatusColor = () => {
    if (usernameStatus === 'available') return 'hsl(var(--theme-success, 120 60% 50%))';
    if (usernameStatus === 'taken' || usernameStatus === 'invalid') return 'hsl(var(--theme-error, 0 60% 50%))';
    return 'hsl(var(--theme-textMuted))';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-2xl p-0 gap-0 overflow-hidden [&>button]:hidden"
        style={{
          backgroundColor: 'hsl(var(--theme-surface))',
          border: '2px solid hsl(var(--theme-primary))',
          borderRadius: '12px'
        }}
      >
        <div className="relative">
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 z-10 p-2 rounded-full transition-colors hover:bg-black/20"
            style={{ color: 'hsl(var(--theme-textMuted))' }}
          >
            <X className="w-5 h-5" />
          </button>

          <div 
            className="p-4 sm:p-6 md:p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--theme-surface)) 0%, hsl(var(--theme-surfaceSecondary)) 100%)'
            }}
          >
            <div className="mb-6">
              <div 
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'hsl(var(--theme-primary))' }}
              >
                <User className="w-10 h-10" style={{ color: 'hsl(var(--theme-textLight))' }} />
              </div>
              <h2 
                className="text-2xl sm:text-3xl font-bold mb-4"
                style={{ 
                  color: 'hsl(var(--theme-text))',
                  fontFamily: 'var(--theme-font-heading)'
                }}
              >
                Hi, my name is...
              </h2>
            </div>

            <div className="mb-6 max-w-md mx-auto">
              <div className="relative mb-3">
                <ThemedInput
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="text-center text-xl sm:text-2xl font-bold h-16 px-6"
                  style={{
                    fontFamily: 'var(--theme-font-heading)',
                    fontSize: '1.5rem',
                    fontWeight: '700',
                  }}
                  maxLength={30}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              <p className="text-sm mb-2" style={{ color: getUsernameStatusColor() }}>
                {getUsernameStatusMessage()}
              </p>
              <p className="text-xs" style={{ color: 'hsl(var(--theme-textMuted))' }}>
                This will be your public display name on Spit Hierarchy
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                onClick={handleSaveUsername}
                disabled={usernameStatus !== 'available' || isSubmitting}
                style={{
                  backgroundColor: usernameStatus === 'available' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-surfaceSecondary))',
                  color: usernameStatus === 'available' ? 'hsl(var(--theme-textLight))' : 'hsl(var(--theme-textMuted))'
                }}
                className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:opacity-90 disabled:hover:opacity-100"
              >
                {isSubmitting ? "Saving..." : "Continue"}
              </Button>
              <Button
                onClick={() => setCurrentStep(1)}
                variant="outline"
                disabled={isSubmitting}
                style={{
                  borderColor: 'hsl(var(--theme-border))',
                  color: 'hsl(var(--theme-textMuted))'
                }}
                className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:bg-black/5"
              >
                Back
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
