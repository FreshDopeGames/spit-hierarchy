import { useEffect } from 'react';

export interface UTMData {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referrer_url: string | null;
  landing_page: string | null;
}

const UTM_STORAGE_KEY = 'spit_hierarchy_utm';
const UTM_FIRST_TOUCH_KEY = 'spit_hierarchy_utm_first_touch';

/**
 * Captures UTM parameters from URL and stores them in sessionStorage/localStorage
 * - sessionStorage: Current session attribution (last-touch)
 * - localStorage: First-touch attribution (preserved across sessions)
 */
export const useUTMCapture = () => {
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    
    const utmData: UTMData = {
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_content: urlParams.get('utm_content'),
      utm_term: urlParams.get('utm_term'),
      referrer_url: document.referrer || null,
      landing_page: window.location.pathname + window.location.search,
    };

    // Only store if we have at least one UTM parameter
    const hasUTMParams = utmData.utm_source || utmData.utm_medium || utmData.utm_campaign;
    
    if (hasUTMParams) {
      // Always update session storage (last-touch attribution)
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utmData));
      
      // Only set first-touch if not already set
      if (!localStorage.getItem(UTM_FIRST_TOUCH_KEY)) {
        localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(utmData));
      }
    } else if (!sessionStorage.getItem(UTM_STORAGE_KEY)) {
      // Store referrer even without UTM params (direct/organic traffic)
      const directData: UTMData = {
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
        referrer_url: document.referrer || null,
        landing_page: window.location.pathname,
      };
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(directData));
      
      if (!localStorage.getItem(UTM_FIRST_TOUCH_KEY)) {
        localStorage.setItem(UTM_FIRST_TOUCH_KEY, JSON.stringify(directData));
      }
    }
  }, []);
};

/**
 * Get the stored UTM data for signup
 * Prioritizes session storage (current session) over localStorage (first touch)
 */
export const getStoredUTMData = (): UTMData | null => {
  try {
    const sessionData = sessionStorage.getItem(UTM_STORAGE_KEY);
    if (sessionData) {
      return JSON.parse(sessionData);
    }
    
    const firstTouchData = localStorage.getItem(UTM_FIRST_TOUCH_KEY);
    if (firstTouchData) {
      return JSON.parse(firstTouchData);
    }
    
    return null;
  } catch {
    return null;
  }
};

/**
 * Get first-touch UTM data (original source that brought the user)
 */
export const getFirstTouchUTMData = (): UTMData | null => {
  try {
    const data = localStorage.getItem(UTM_FIRST_TOUCH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
};

/**
 * Clear UTM data after successful signup
 */
export const clearUTMData = () => {
  sessionStorage.removeItem(UTM_STORAGE_KEY);
  // Keep first-touch for potential future analytics
};
