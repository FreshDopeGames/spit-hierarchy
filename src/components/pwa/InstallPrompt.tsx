import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Bell, Share, Plus, MoreVertical, MoreHorizontal, Monitor, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

const DISMISS_KEY = 'pwa_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

type BrowserGuide = 'ios' | 'firefox-android' | 'firefox-desktop' | 'safari-desktop' | 'chrome-desktop' | 'edge-desktop' | 'unsupported' | null;

export const InstallPrompt = () => {
  const { 
    canInstall, 
    isIOS, 
    isInstalled, 
    promptInstall, 
    requestNotificationPermission,
    notificationPermission,
    browser,
    platform
  } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showBrowserGuide, setShowBrowserGuide] = useState<BrowserGuide>(null);

  // Determine if we should show the prompt
  const shouldShowInstallOption = () => {
    if (isInstalled) return false;
    if (canInstall) return true; // Native prompt available
    if (isIOS) return true; // iOS manual instructions
    if (browser === 'firefox' && platform === 'android') return true; // Firefox Android manual
    if (platform === 'desktop' && (browser === 'chrome' || browser === 'edge')) return true; // Desktop Chrome/Edge fallback
    return false;
  };

  useEffect(() => {
    // Check if dismissed recently
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const dismissTime = parseInt(dismissedAt, 10);
      if (Date.now() - dismissTime < DISMISS_DURATION) {
        return;
      }
    }

    // Show prompt after 10 seconds if installable
    const timer = setTimeout(() => {
      if (shouldShowInstallOption() && !isInstalled) {
        setShowPrompt(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [canInstall, isIOS, isInstalled, browser, platform]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowBrowserGuide(null);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    // Try native prompt first
    if (canInstall) {
      const result = await promptInstall();
      if (result.success) {
        toast.success('App installed successfully!', {
          description: 'Spit Hierarchy is now on your home screen'
        });
        setShowPrompt(false);
        return;
      }
    }

    // Show browser-specific manual instructions
    if (isIOS) {
      setShowBrowserGuide('ios');
    } else if (browser === 'firefox' && platform === 'android') {
      setShowBrowserGuide('firefox-android');
    } else if (browser === 'firefox' && platform === 'desktop') {
      setShowBrowserGuide('firefox-desktop');
    } else if (browser === 'safari' && platform === 'desktop') {
      setShowBrowserGuide('safari-desktop');
    } else if (browser === 'chrome' && platform === 'desktop') {
      setShowBrowserGuide('chrome-desktop');
    } else if (browser === 'edge' && platform === 'desktop') {
      setShowBrowserGuide('edge-desktop');
    } else {
      setShowBrowserGuide('unsupported');
    }
  };

  const handleEnableNotifications = async () => {
    const result = await requestNotificationPermission();
    if (result.success) {
      toast.success('Notifications enabled!', {
        description: "You'll get updates on rankings, achievements, and more"
      });
    } else if (result.reason === 'denied') {
      toast.error('Notifications blocked', {
        description: 'You can enable them in your browser settings'
      });
    }
  };

  const renderBrowserGuide = () => {
    const StepNumber = ({ num }: { num: number }) => (
      <span className="bg-[hsl(var(--theme-primary))]/20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-[hsl(var(--theme-primary))] shrink-0">
        {num}
      </span>
    );

    const GuideWrapper = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[hsl(var(--theme-primary))]/20 flex items-center justify-center">
            <Icon className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
          </div>
          <h3 className="font-bold text-[hsl(var(--theme-text))]">{title}</h3>
        </div>
        {children}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowBrowserGuide(null)}
          className="w-full mt-2"
        >
          Got it
        </Button>
      </div>
    );

    switch (showBrowserGuide) {
      case 'ios':
        return (
          <GuideWrapper title="Install on iOS" icon={Smartphone}>
            <ol className="text-sm text-[hsl(var(--theme-text))]/70 space-y-2 pl-2">
              <li className="flex items-center gap-2">
                <StepNumber num={1} />
                Tap <Share className="w-4 h-4 inline mx-1 text-[hsl(var(--theme-primary))]" /> Share button
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={2} />
                Scroll down, tap <Plus className="w-4 h-4 inline mx-1" /> "Add to Home Screen"
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={3} />
                Tap "Add" to confirm
              </li>
            </ol>
          </GuideWrapper>
        );

      case 'firefox-android':
        return (
          <GuideWrapper title="Install on Firefox" icon={Smartphone}>
            <ol className="text-sm text-[hsl(var(--theme-text))]/70 space-y-2 pl-2">
              <li className="flex items-center gap-2">
                <StepNumber num={1} />
                Tap <MoreVertical className="w-4 h-4 inline mx-1 text-[hsl(var(--theme-primary))]" /> Menu (three dots)
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={2} />
                Tap "Add to Home screen"
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={3} />
                Tap "Add" to confirm
              </li>
            </ol>
          </GuideWrapper>
        );

      case 'chrome-desktop':
        return (
          <GuideWrapper title="Install on Chrome" icon={Monitor}>
            <ol className="text-sm text-[hsl(var(--theme-text))]/70 space-y-2 pl-2">
              <li className="flex items-center gap-2">
                <StepNumber num={1} />
                Click <MoreVertical className="w-4 h-4 inline mx-1 text-[hsl(var(--theme-primary))]" /> Menu (three dots) in toolbar
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={2} />
                Select "Save and share" → "Install page as app..."
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={3} />
                Click "Install" to confirm
              </li>
            </ol>
          </GuideWrapper>
        );

      case 'edge-desktop':
        return (
          <GuideWrapper title="Install on Edge" icon={Monitor}>
            <ol className="text-sm text-[hsl(var(--theme-text))]/70 space-y-2 pl-2">
              <li className="flex items-center gap-2">
                <StepNumber num={1} />
                Click <MoreHorizontal className="w-4 h-4 inline mx-1 text-[hsl(var(--theme-primary))]" /> Menu (three dots) in toolbar
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={2} />
                Select "Apps" → "Install this site as an app"
              </li>
              <li className="flex items-center gap-2">
                <StepNumber num={3} />
                Click "Install" to confirm
              </li>
            </ol>
          </GuideWrapper>
        );

      case 'firefox-desktop':
      case 'safari-desktop':
        return (
          <GuideWrapper title="Browser Not Supported" icon={AlertCircle}>
            <p className="text-sm text-[hsl(var(--theme-text))]/70">
              {browser === 'firefox' ? 'Firefox' : 'Safari'} doesn't support installing web apps on desktop.
            </p>
            <p className="text-sm text-[hsl(var(--theme-text))]/70">
              For the best experience, try opening this site in <strong>Chrome</strong> or <strong>Edge</strong>.
            </p>
          </GuideWrapper>
        );

      case 'unsupported':
        return (
          <GuideWrapper title="Installation Not Available" icon={AlertCircle}>
            <p className="text-sm text-[hsl(var(--theme-text))]/70">
              Your browser doesn't support installing this app. Try using Chrome, Edge, or Safari on mobile.
            </p>
          </GuideWrapper>
        );

      default:
        return null;
    }
  };

  if (isInstalled && notificationPermission === 'granted') {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50"
        >
          <div className="bg-[hsl(var(--theme-card))] border border-[hsl(var(--theme-primary))]/30 rounded-xl p-4 shadow-2xl">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 p-1 text-[hsl(var(--theme-text))]/50 hover:text-[hsl(var(--theme-text))] transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-5 h-5" />
            </button>

            {showBrowserGuide ? (
              renderBrowserGuide()
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))] flex items-center justify-center">
                    <Download className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-[hsl(var(--theme-text))]">Get the App</h3>
                    <p className="text-xs text-[hsl(var(--theme-text))]/60">Full screen experience</p>
                  </div>
                </div>
                
                <p className="text-sm text-[hsl(var(--theme-text))]/70">
                  Install Spit Hierarchy for a better experience with instant access from your home screen.
                </p>

                <div className="flex gap-2">
                  {!isInstalled && (
                    <Button 
                      onClick={handleInstall}
                      className="flex-1 bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))]"
                      size="sm"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Install
                    </Button>
                  )}
                  
                  {notificationPermission !== 'granted' && notificationPermission !== 'unsupported' && (
                    <Button 
                      onClick={handleEnableNotifications}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Bell className="w-4 h-4 mr-2" />
                      Notifications
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
