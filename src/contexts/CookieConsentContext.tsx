import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  ConsentState,
  ConsentCategory,
  CookieConsentContextType,
} from '@/types/cookieConsent';
import {
  getStoredConsent,
  saveConsent,
  clearConsent,
  detectRegion,
  detectDoNotTrack,
} from '@/utils/cookieConsent';

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider');
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider = ({ children }: CookieConsentProviderProps) => {
  const [consentState, setConsentState] = useState<ConsentState | null>(null);
  const [isConsentGiven, setIsConsentGiven] = useState(false);

  useEffect(() => {
    // Check for stored consent on mount
    const stored = getStoredConsent();
    
    // Respect Do Not Track header
    if (detectDoNotTrack() && !stored) {
      const region = detectRegion();
      const autoConsent = saveConsent(false, false, false, 'reject_all', region);
      setConsentState(autoConsent);
      setIsConsentGiven(true);
      return;
    }
    
    if (stored) {
      setConsentState(stored);
      setIsConsentGiven(true);
    }
  }, []);

  const updateConsent = (updates: Partial<Omit<ConsentState, 'necessary' | 'version' | 'timestamp' | 'expiresAt'>>) => {
    const region = detectRegion();
    const newConsent = saveConsent(
      updates.analytics ?? false,
      updates.advertising ?? false,
      updates.functional ?? false,
      updates.consentMethod ?? 'custom',
      region
    );
    setConsentState(newConsent);
    setIsConsentGiven(true);
  };

  const acceptAll = () => {
    const region = detectRegion();
    const newConsent = saveConsent(true, true, true, 'accept_all', region);
    setConsentState(newConsent);
    setIsConsentGiven(true);
  };

  const rejectAll = () => {
    const region = detectRegion();
    const newConsent = saveConsent(false, false, false, 'reject_all', region);
    setConsentState(newConsent);
    setIsConsentGiven(true);
  };

  const resetConsent = () => {
    clearConsent();
    setConsentState(null);
    setIsConsentGiven(false);
  };

  const hasConsent = (category: ConsentCategory): boolean => {
    if (!consentState) return false;
    if (category === 'necessary') return true;
    return consentState[category] ?? false;
  };

  const value: CookieConsentContextType = {
    consentState,
    isConsentGiven,
    updateConsent,
    acceptAll,
    rejectAll,
    resetConsent,
    hasConsent,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
};
