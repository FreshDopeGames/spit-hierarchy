import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import OnboardingModal from "./OnboardingModal";
import { toast } from "sonner";

interface OnboardingContextType {
  isOnboardingOpen: boolean;
  openOnboarding: () => void;
  closeOnboarding: () => void;
  completeOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType>({
  isOnboardingOpen: false,
  openOnboarding: () => {},
  closeOnboarding: () => {},
  completeOnboarding: () => {},
});

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider");
  }
  return context;
};

interface OnboardingProviderProps {
  children: React.ReactNode;
}

export const OnboardingProvider = ({ children }: OnboardingProviderProps) => {
  const { user, loading: authLoading } = useAuth();
  const { needsOnboarding, isLoading: onboardingLoading } = useOnboardingStatus();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);

  // Check if we should show onboarding
  useEffect(() => {
    // Don't show onboarding if:
    // - Auth is still loading
    // - Onboarding status is still loading
    // - User is not authenticated
    // - User doesn't need onboarding
    // - We've already shown onboarding this session
    if (authLoading || onboardingLoading || !user || !needsOnboarding || hasShownOnboarding) {
      return;
    }

    // Check localStorage to see if user has dismissed onboarding recently
    const dismissedAt = localStorage.getItem(`onboarding-dismissed-${user.id}`);
    if (dismissedAt) {
      const dismissTime = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissTime.getTime()) / (1000 * 60 * 60 * 24);
      
      // Don't show again for 7 days if dismissed
      if (daysSinceDismiss < 7) {
        return;
      }
    }

    // Show onboarding after a short delay to ensure everything is loaded
    const timer = setTimeout(() => {
      setIsOnboardingOpen(true);
      setHasShownOnboarding(true);
    }, 1000);

    return () => clearTimeout(timer);
  }, [user, needsOnboarding, authLoading, onboardingLoading, hasShownOnboarding]);

  const openOnboarding = () => {
    setIsOnboardingOpen(true);
  };

  const closeOnboarding = () => {
    setIsOnboardingOpen(false);
    
    // Store dismissal time in localStorage
    if (user) {
      localStorage.setItem(`onboarding-dismissed-${user.id}`, new Date().toISOString());
    }
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    toast.success("Welcome to Spit Hierarchy! Your top 5 has been saved.");
    
    // Clear dismissal time since they completed it
    if (user) {
      localStorage.removeItem(`onboarding-dismissed-${user.id}`);
    }
  };

  const value = {
    isOnboardingOpen,
    openOnboarding,
    closeOnboarding,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
      />
    </OnboardingContext.Provider>
  );
};