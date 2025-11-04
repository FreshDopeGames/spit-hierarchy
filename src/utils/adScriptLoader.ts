/**
 * Dynamically loads Google AdSense script only after user consent
 */

let adSenseLoaded = false;
let adSenseLoading = false;

export const loadAdSenseScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (adSenseLoaded) {
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (adSenseLoading) {
      const checkInterval = setInterval(() => {
        if (adSenseLoaded) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 100);
      return;
    }

    adSenseLoading = true;

    // Create script element
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2518650700414992';
    script.crossOrigin = 'anonymous';

    script.onload = () => {
      adSenseLoaded = true;
      adSenseLoading = false;
      console.log('[AdSense] Script loaded successfully');
      resolve();
    };

    script.onerror = () => {
      adSenseLoading = false;
      console.error('[AdSense] Failed to load script');
      reject(new Error('Failed to load AdSense script'));
    };

    // Append to document head
    document.head.appendChild(script);
  });
};

export const isAdSenseLoaded = () => adSenseLoaded;
