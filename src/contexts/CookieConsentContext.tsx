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
import { supabase } from '@/integrations/supabase/client';

// Generate a session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('consent-session-id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('consent-session-id', sessionId);
  }
  return sessionId;
};

// Log consent action to database
const logConsentAction = async (
  consentState: ConsentState,
  action: string
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    const sessionId = getSessionId();
    
    await supabase.from('consent_logs').insert({
      action,
      consent_state: consentState as any,
      region: consentState.region,
      session_id: sessionId,
      ip_address: null,
      user_agent: navigator.userAgent,
      user_id: user?.id || null,
    });
  } catch (error) {
    console.error('Failed to log consent:', error);
    // Don't block the user if logging fails
  }
};

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
    logConsentAction(newConsent, 'custom');
  };

  const acceptAll = () => {
    const region = detectRegion();
    const newConsent = saveConsent(true, true, true, 'accept_all', region);
    setConsentState(newConsent);
    setIsConsentGiven(true);
    logConsentAction(newConsent, 'accept_all');
  };

  const rejectAll = () => {
    const region = detectRegion();
    const newConsent = saveConsent(false, false, false, 'reject_all', region);
    setConsentState(newConsent);
    setIsConsentGiven(true);
    logConsentAction(newConsent, 'reject_all');
  };

  const resetConsent = () => {
    clearConsent();
    setConsentState(null);
    setIsConsentGiven(false);
    // Log reset action
    const region = detectRegion();
    logConsentAction(
      { version: 'v1', necessary: true, analytics: false, advertising: false, functional: false, timestamp: Date.now(), expiresAt: Date.now(), region, consentMethod: 'reject_all' },
      'reset'
    );
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
