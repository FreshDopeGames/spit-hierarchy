import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useOnboardingStatus } from "@/hooks/useOnboardingStatus";
import { useNavigate } from "react-router-dom";
import OnboardingModal from "./OnboardingModal";
import { toast } from "sonner";
import { useCookieConsent } from "@/contexts/CookieConsentContext";

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
  const { hasConsent } = useCookieConsent();
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [hasShownOnboarding, setHasShownOnboarding] = useState(false);
  const navigate = useNavigate();

  // Check if we should show onboarding
  useEffect(() => {
    if (authLoading || onboardingLoading || !user || !needsOnboarding || hasShownOnboarding) {
      return;
    }

    let dismissedAt: string | null = null;
    if (hasConsent('functional')) {
      dismissedAt = localStorage.getItem(`onboarding-dismissed-${user.id}`);
    }
    
    if (dismissedAt) {
      const dismissTime = new Date(dismissedAt);
      const now = new Date();
      const daysSinceDismiss = (now.getTime() - dismissTime.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceDismiss < 7) {
        return;
      }
    }

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
    
    if (user && hasConsent('functional')) {
      localStorage.setItem(`onboarding-dismissed-${user.id}`, new Date().toISOString());
    }
  };

  const completeOnboarding = () => {
    setIsOnboardingOpen(false);
    
    if (user && hasConsent('functional')) {
      localStorage.removeItem(`onboarding-dismissed-${user.id}`);
    }

    // Set flag for the Top 5 guide overlay, then navigate to profile
    localStorage.setItem('show-top5-guide', 'true');
    navigate('/profile');
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
