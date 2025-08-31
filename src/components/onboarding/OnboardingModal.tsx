import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Star, Trophy, Users } from "lucide-react";
import TopFiveSlot from "@/components/profile/TopFiveSlot";
import RapperSearchOverlay from "@/components/profile/RapperSearchOverlay";
import { useUserTopRappers } from "@/hooks/useUserTopRappers";

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
          className="max-w-2xl p-0 gap-0 overflow-hidden"
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
              className="p-8 text-center"
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
                  className="text-3xl font-bold mb-4"
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={() => setCurrentStep(2)}
                  style={{
                    backgroundColor: 'hsl(var(--theme-primary))',
                    color: 'hsl(var(--theme-textLight))'
                  }}
                  className="px-8 py-3 text-lg hover:opacity-90"
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
                  className="px-8 py-3 text-lg hover:bg-black/5"
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

  return (
    <>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-y-auto p-0 gap-0"
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

            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle 
                  className="text-2xl text-center"
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
                        onClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {slots.slice(2, 5).map((slot) => (
                      <TopFiveSlot
                        key={slot.position}
                        position={slot.position}
                        rapper={slot.rapper}
                        onClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="block lg:hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {slots.map((slot) => (
                      <TopFiveSlot
                        key={slot.position}
                        position={slot.position}
                        rapper={slot.rapper}
                        onClick={() => handleSlotClick(slot.position)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <Button
                  onClick={handleComplete}
                  disabled={!canComplete}
                  style={{
                    backgroundColor: canComplete ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-surfaceSecondary))',
                    color: canComplete ? 'hsl(var(--theme-textLight))' : 'hsl(var(--theme-textMuted))'
                  }}
                  className="px-8 py-3 text-lg hover:opacity-90 disabled:hover:opacity-100"
                >
                  Complete Setup
                </Button>
                <Button
                  onClick={handleSkip}
                  variant="outline"
                  style={{
                    borderColor: 'hsl(var(--theme-border))',
                    color: 'hsl(var(--theme-textMuted))'
                  }}
                  className="px-8 py-3 text-lg hover:bg-black/5"
                >
                  Skip for Now
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