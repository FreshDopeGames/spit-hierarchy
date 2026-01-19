import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ThemedInput } from "@/components/ui/themed-input";
import { X, Star, Trophy, Users, User, Check, AlertCircle } from "lucide-react";
import TopFiveSlot from "@/components/profile/TopFiveSlot";
import RapperSearchOverlay from "@/components/profile/RapperSearchOverlay";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const OnboardingModal = ({ isOpen, onClose, onComplete }: OnboardingModalProps) => {
  const { topRappers, updateTopRapper, selectedRapperIds } = useUserTopRappers();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [username, setUsername] = useState("");
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'available' | 'taken' | 'invalid'>('idle');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  const handleSlotClick = (position: number) => {
    setSelectedPosition(position);
    setIsSearchOpen(true);
  };

  const handleRapperSelect = (rapperId: string) => {
    if (selectedPosition !== null) {
      updateTopRapper({ position: selectedPosition, rapperId });
      setIsSearchOpen(false);
      setSelectedPosition(null);
    }
  };

  const handleCloseSearch = () => {
    setIsSearchOpen(false);
    setSelectedPosition(null);
  };

  // Username validation
  useEffect(() => {
    const checkUsername = async () => {
      if (!username.trim() || username.length < 3) {
        setUsernameStatus('idle');
        return;
      }

      // Basic validation
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

  const handleUsernameNext = async () => {
    if (usernameStatus !== 'available') return;
    
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ username: username.trim() })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) throw error;
      
      setCurrentStep(3); // Move to Top 5 step
    } catch (error) {
      console.error('Error updating username:', error);
      toast.error('Failed to save username. Please try again.');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  // Create array of 5 positions with current data
  const slots = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null,
    };
  });

  const filledSlots = slots.filter(slot => slot.rapper !== null).length;
  const canComplete = filledSlots > 0;

  if (currentStep === 1) {
    return (
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-2xl p-0 gap-0 overflow-hidden"
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
                  Let's get you started by selecting your Top 5 rappers. This helps us personalize your experience and connect you with the community.
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
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: 'hsl(var(--theme-text))' }}
                  >
                    Personalized Rankings
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--theme-textMuted))' }}
                  >
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
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: 'hsl(var(--theme-text))' }}
                  >
                    Community Connection
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--theme-textMuted))' }}
                  >
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
                  <h3 
                    className="font-semibold mb-2"
                    style={{ color: 'hsl(var(--theme-text))' }}
                  >
                    Better Recommendations
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: 'hsl(var(--theme-textMuted))' }}
                  >
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

  // Step 2: Username Creation
  if (currentStep === 2) {
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
          className="max-w-[95vw] sm:max-w-2xl p-0 gap-0 overflow-hidden"
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
                <p 
                  className="text-sm mb-2"
                  style={{ color: getUsernameStatusColor() }}
                >
                  {getUsernameStatusMessage()}
                </p>
                <p 
                  className="text-xs"
                  style={{ color: 'hsl(var(--theme-textMuted))' }}
                >
                  This will be your public display name on Spit Hierarchy
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={handleUsernameNext}
                  disabled={usernameStatus !== 'available' || isUpdatingProfile}
                  style={{
                    backgroundColor: usernameStatus === 'available' ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-surfaceSecondary))',
                    color: usernameStatus === 'available' ? 'hsl(var(--theme-textLight))' : 'hsl(var(--theme-textMuted))'
                  }}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:opacity-90 disabled:hover:opacity-100"
                >
                  {isUpdatingProfile ? "Saving..." : "Continue"}
                </Button>
                <Button
                  onClick={() => setCurrentStep(1)}
                  variant="outline"
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
  }

  // Step 3: Top 5 Selection
  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0"
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

            <div className="p-3 sm:p-4 md:p-6">
              <DialogHeader className="mb-6">
                <DialogTitle 
                  className="text-xl sm:text-2xl text-center"
                  style={{ 
                    color: 'hsl(var(--theme-text))',
                    fontFamily: 'var(--theme-font-heading)'
                  }}
                >
                  Select Your Top 5 Rappers
                </DialogTitle>
                <p 
                  className="text-center mt-2"
                  style={{ color: 'hsl(var(--theme-textMuted))' }}
                >
                  Choose your favorite rappers to personalize your experience. You can always change these later.
                </p>
                <p 
                  className="text-center text-sm mt-2 font-medium"
                  style={{ color: 'hsl(var(--theme-primary))' }}
                >
                  {filledSlots}/5 selected
                </p>
              </DialogHeader>

              {/* Top 5 Selection Grid */}
              <div className="mb-6">
                {/* Desktop Layout */}
                <div className="hidden lg:block">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {slots.slice(0, 2).map((slot) => (
                      <TopFiveSlot
                        key={slot.position}
                        position={slot.position}
                        rapper={slot.rapper}
                        onEditClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {slots.slice(2, 5).map((slot) => (
                      <TopFiveSlot
                        key={slot.position}
                        position={slot.position}
                        rapper={slot.rapper}
                        onEditClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4">
                    {slots.map((slot) => (
                      <TopFiveSlot
                        key={slot.position}
                        position={slot.position}
                        rapper={slot.rapper}
                        onEditClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Button
                  onClick={handleComplete}
                  disabled={!canComplete}
                  style={{
                    backgroundColor: canComplete ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-surfaceSecondary))',
                    color: canComplete ? 'hsl(var(--theme-textLight))' : 'hsl(var(--theme-textMuted))'
                  }}
                  className="px-4 py-2 sm:px-8 sm:py-3 text-base sm:text-lg hover:opacity-90 disabled:hover:opacity-100"
                >
                  Complete Setup
                </Button>
                <Button
                  onClick={() => setCurrentStep(2)}
                  variant="outline"
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

      <RapperSearchOverlay
        isOpen={isSearchOpen}
        onClose={handleCloseSearch}
        onSelectRapper={handleRapperSelect}
        excludeIds={selectedRapperIds}
        position={selectedPosition || 1}
      />
    </>
  );
};

export default OnboardingModal;