import { useState } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookiePreferencesModal } from '@/components/CookiePreferencesModal';
import { Link } from 'react-router-dom';

export const CookieConsentBanner = () => {
  const { isConsentGiven, acceptAll, rejectAll } = useCookieConsent();
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if consent already given or manually dismissed
  if (isConsentGiven || isDismissed) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-[9999] animate-in slide-in-from-bottom-5 duration-500">
        <div className="bg-gradient-to-r from-background/95 via-background/98 to-background/95 backdrop-blur-lg border-t border-border shadow-2xl">
          <div className="container mx-auto px-4 py-4 md:py-5">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              {/* Icon & Message */}
              <div className="flex items-start gap-3 flex-1">
                <Cookie className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="font-semibold text-base mb-1">We Value Your Privacy</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    We use cookies to enhance your experience, serve personalized ads, and analyze our traffic. 
                    By clicking "Accept All", you consent to our use of cookies.{' '}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPreferencesOpen(true)}
                  className="flex-1 md:flex-none"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Customize
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    rejectAll();
                    setIsDismissed(true);
                  }}
                  className="flex-1 md:flex-none"
                >
                  Reject All
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    acceptAll();
                    setIsDismissed(true);
                  }}
                  className="flex-1 md:flex-none"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
};
