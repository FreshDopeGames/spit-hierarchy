import { ConsentState, ConsentRegion, ConsentMethod } from '@/types/cookieConsent';

const CONSENT_STORAGE_KEY = 'cookie-consent-v1';
const CONSENT_VERSION = 'v1';
const CONSENT_DURATION_MS = 365 * 24 * 60 * 60 * 1000; // 12 months

export const getStoredConsent = (): ConsentState | null => {
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!stored) return null;

    const consent: ConsentState = JSON.parse(stored);
    
    // Check if consent has expired
    if (Date.now() > consent.expiresAt) {
      localStorage.removeItem(CONSENT_STORAGE_KEY);
      return null;
    }

    return consent;
  } catch (error) {
    console.error('Error reading consent:', error);
    return null;
  }
};

export const saveConsent = (
  analytics: boolean,
  advertising: boolean,
  functional: boolean,
  method: ConsentMethod,
  region: ConsentRegion = 'OTHER'
): ConsentState => {
  const timestamp = Date.now();
  const consent: ConsentState = {
    version: CONSENT_VERSION,
    necessary: true,
    analytics,
    advertising,
    functional,
    timestamp,
    expiresAt: timestamp + CONSENT_DURATION_MS,
    region,
    consentMethod: method,
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consent));
  } catch (error) {
    console.error('Error saving consent:', error);
  }

  return consent;
};

export const clearConsent = (): void => {
  try {
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing consent:', error);
  }
};

export const detectRegion = (): ConsentRegion => {
  // Simple timezone-based detection as fallback
  // In Phase 3, we'll enhance this with IP geolocation
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // EU/EEA timezones (simplified)
  const euTimezones = [
    'Europe/', 'Atlantic/Reykjavik', 'Atlantic/Canary', 
    'Atlantic/Faroe', 'Atlantic/Madeira'
  ];
  
  if (euTimezones.some(tz => timezone.startsWith(tz))) {
    return 'EU';
  }
  
  // California
  if (timezone === 'America/Los_Angeles') {
    return 'CA';
  }
  
  return 'OTHER';
};

export const shouldShowBanner = (): boolean => {
  const consent = getStoredConsent();
  return consent === null;
};

export const detectDoNotTrack = (): boolean => {
  return (
    navigator.doNotTrack === '1' ||
    (window as any).doNotTrack === '1' ||
    navigator.doNotTrack === 'yes'
  );
};
