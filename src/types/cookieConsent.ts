export type ConsentCategory = 'necessary' | 'analytics' | 'advertising' | 'functional';

export type ConsentRegion = 'EU' | 'CA' | 'OTHER';

export type ConsentMethod = 'accept_all' | 'reject_all' | 'custom';

export interface ConsentState {
  version: string;
  necessary: true;
  analytics: boolean;
  advertising: boolean;
  functional: boolean;
  timestamp: number;
  expiresAt: number;
  region: ConsentRegion;
  consentMethod: ConsentMethod;
}

export interface CookieConsentContextType {
  consentState: ConsentState | null;
  isConsentGiven: boolean;
  updateConsent: (updates: Partial<Omit<ConsentState, 'necessary' | 'version' | 'timestamp' | 'expiresAt'>>) => void;
  acceptAll: () => void;
  rejectAll: () => void;
  resetConsent: () => void;
  hasConsent: (category: ConsentCategory) => boolean;
}

export interface CookieCategory {
  id: ConsentCategory;
  label: string;
  description: string;
  required: boolean;
  cookies: string[];
}
