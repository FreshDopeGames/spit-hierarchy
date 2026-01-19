import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Bell, Share, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePWA } from '@/hooks/usePWA';
import { toast } from 'sonner';

const DISMISS_KEY = 'pwa_install_dismissed';
const DISMISS_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

export const InstallPrompt = () => {
  const { 
    canInstall, 
    isIOS, 
    isInstalled, 
    promptInstall, 
    requestNotificationPermission,
    notificationPermission 
  } = usePWA();
  const [showPrompt, setShowPrompt] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

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
      if ((canInstall || (isIOS && !isInstalled)) && !isInstalled) {
        setShowPrompt(true);
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [canInstall, isIOS, isInstalled]);

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowIOSGuide(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  };

  const handleInstall = async () => {
    if (isIOS) {
      setShowIOSGuide(true);
      return;
    }

    const result = await promptInstall();
    if (result.success) {
      toast.success('App installed successfully!', {
        description: 'Spit Hierarchy is now on your home screen'
      });
      setShowPrompt(false);
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

            {showIOSGuide ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[hsl(var(--theme-primary))]/20 flex items-center justify-center">
                    <Smartphone className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
                  </div>
                  <h3 className="font-bold text-[hsl(var(--theme-text))]">Install on iOS</h3>
                </div>
                <ol className="text-sm text-[hsl(var(--theme-text))]/70 space-y-2 pl-2">
                  <li className="flex items-center gap-2">
                    <span className="bg-[hsl(var(--theme-primary))]/20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-[hsl(var(--theme-primary))]">1</span>
                    Tap <Share className="w-4 h-4 inline mx-1 text-[hsl(var(--theme-primary))]" /> Share button
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[hsl(var(--theme-primary))]/20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-[hsl(var(--theme-primary))]">2</span>
                    Scroll down, tap <Plus className="w-4 h-4 inline mx-1" /> "Add to Home Screen"
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="bg-[hsl(var(--theme-primary))]/20 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold text-[hsl(var(--theme-primary))]">3</span>
                    Tap "Add" to confirm
                  </li>
                </ol>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowIOSGuide(false)}
                  className="w-full mt-2"
                >
                  Got it
                </Button>
              </div>
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
