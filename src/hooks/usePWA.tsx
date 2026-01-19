import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

type BrowserType = 'chrome' | 'edge' | 'firefox' | 'safari' | 'opera' | 'other';
type PlatformType = 'ios' | 'android' | 'desktop';

interface PWAState {
  isInstallable: boolean;
  isInstalled: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isStandalone: boolean;
  browser: BrowserType;
  platform: PlatformType;
  notificationPermission: NotificationPermission | 'unsupported';
}

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [state, setState] = useState<PWAState>({
    isInstallable: false,
    isInstalled: false,
    isIOS: false,
    isAndroid: false,
    isStandalone: false,
    browser: 'other',
    platform: 'desktop',
    notificationPermission: 'unsupported'
  });

  useEffect(() => {
    // Check if running in standalone mode (installed PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone === true;
    
    const ua = navigator.userAgent;
    
    // Check for iOS
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    
    // Check for Android
    const isAndroid = /Android/.test(ua);
    
    // Detect browser
    let browser: BrowserType = 'other';
    if (ua.includes('Edg/')) {
      browser = 'edge';
    } else if (ua.includes('OPR/') || ua.includes('Opera')) {
      browser = 'opera';
    } else if (ua.includes('Chrome')) {
      browser = 'chrome';
    } else if (ua.includes('Firefox')) {
      browser = 'firefox';
    } else if (ua.includes('Safari')) {
      browser = 'safari';
    }
    
    // Detect platform
    let platform: PlatformType = 'desktop';
    if (isIOS) {
      platform = 'ios';
    } else if (isAndroid) {
      platform = 'android';
    }
    
    // Check notification support
    const notificationPermission = 'Notification' in window 
      ? Notification.permission 
      : 'unsupported';

    setState(prev => ({
      ...prev,
      isStandalone,
      isIOS,
      isAndroid,
      browser,
      platform,
      isInstalled: isStandalone,
      notificationPermission
    }));

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setState(prev => ({ ...prev, isInstallable: true }));
    };

    // Listen for app installed
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setState(prev => ({ 
        ...prev, 
        isInstallable: false, 
        isInstalled: true 
      }));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) {
      return { success: false, reason: 'no-prompt' as const };
    }

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setState(prev => ({ ...prev, isInstallable: false }));
        return { success: true, outcome };
      }
      
      return { success: false, reason: 'dismissed' as const };
    } catch (error) {
      console.error('Error prompting install:', error);
      return { success: false, reason: 'error' as const };
    }
  }, [deferredPrompt]);

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      return { success: false, reason: 'unsupported' as const };
    }

    if (Notification.permission === 'granted') {
      return { success: true, permission: 'granted' as const };
    }

    if (Notification.permission === 'denied') {
      return { success: false, reason: 'denied' as const };
    }

    try {
      const permission = await Notification.requestPermission();
      setState(prev => ({ ...prev, notificationPermission: permission }));
      
      if (permission === 'granted') {
        return { success: true, permission };
      }
      
      return { success: false, reason: permission as 'denied' | 'default' };
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return { success: false, reason: 'error' as const };
    }
  }, []);

  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
        return true;
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
        return true;
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error entering fullscreen:', error);
      return false;
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        return true;
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
        return true;
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error exiting fullscreen:', error);
      return false;
    }
  }, []);

  const isFullscreen = useCallback(() => {
    return !!(document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).msFullscreenElement);
  }, []);

  return {
    ...state,
    promptInstall,
    requestNotificationPermission,
    enterFullscreen,
    exitFullscreen,
    isFullscreen,
    canInstall: state.isInstallable && !state.isInstalled
  };
};
