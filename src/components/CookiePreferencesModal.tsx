import { useState, useEffect } from 'react';
import { Cookie, Shield, BarChart3, Megaphone, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCookieConsent } from '@/contexts/CookieConsentContext';
import { CookieCategory } from '@/types/cookieConsent';
import { Link } from 'react-router-dom';

interface CookiePreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const cookieCategories: CookieCategory[] = [
  {
    id: 'necessary',
    label: 'Strictly Necessary',
    description: 'Essential cookies for site functionality, security, and authentication. These cannot be disabled.',
    required: true,
    cookies: ['session', 'auth-token', 'csrf-token'],
  },
  {
    id: 'functional',
    label: 'Functional Cookies',
    description: 'Remember your preferences like theme, sidebar state, and personalization settings.',
    required: false,
    cookies: ['theme-preference', 'sidebar-state', 'onboarding-dismissed'],
  },
  {
    id: 'analytics',
    label: 'Analytics Cookies',
    description: 'Help us understand how visitors interact with our site to improve your experience.',
    required: false,
    cookies: ['page-views', 'session-tracking', 'user-behavior'],
  },
  {
    id: 'advertising',
    label: 'Advertising Cookies',
    description: 'Used to show you relevant ads and support our platform through Google AdSense.',
    required: false,
    cookies: ['google-adsense', 'ad-personalization', 'ad-measurement'],
  },
];

const categoryIcons = {
  necessary: Shield,
  functional: Sparkles,
  analytics: BarChart3,
  advertising: Megaphone,
};

export const CookiePreferencesModal = ({ isOpen, onClose }: CookiePreferencesModalProps) => {
  const { consentState, updateConsent, acceptAll } = useCookieConsent();
  
  const [preferences, setPreferences] = useState({
    functional: false,
    analytics: false,
    advertising: false,
  });

  useEffect(() => {
    if (consentState) {
      setPreferences({
        functional: consentState.functional,
        analytics: consentState.analytics,
        advertising: consentState.advertising,
      });
    }
  }, [consentState]);

  const handleToggle = (category: 'functional' | 'analytics' | 'advertising') => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleSave = () => {
    updateConsent({
      functional: preferences.functional,
      analytics: preferences.analytics,
      advertising: preferences.advertising,
      consentMethod: 'custom',
    });
    onClose();
  };

  const handleAcceptAll = () => {
    acceptAll();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <Cookie className="h-6 w-6 text-primary" />
            <DialogTitle>Cookie Preferences</DialogTitle>
          </div>
          <DialogDescription>
            Manage your cookie preferences below. You can enable or disable different types of cookies based on your preferences.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {cookieCategories.map((category) => {
            const Icon = categoryIcons[category.id];
            const isChecked = category.required || preferences[category.id as keyof typeof preferences];
            
            return (
              <div key={category.id} className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <Icon className="h-5 w-5 text-primary mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2">
                        <Label htmlFor={category.id} className="text-base font-semibold cursor-pointer">
                          {category.label}
                        </Label>
                        {category.required && (
                          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                            Always Active
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {category.description}
                      </p>
                      <div className="text-xs text-muted-foreground pt-1">
                        <span className="font-medium">Cookies:</span> {category.cookies.join(', ')}
                      </div>
                    </div>
                  </div>
                  <Switch
                    id={category.id}
                    checked={isChecked}
                    onCheckedChange={() => !category.required && handleToggle(category.id as any)}
                    disabled={category.required}
                    className="mt-1"
                  />
                </div>
                {category.id !== 'advertising' && <Separator />}
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-3 pt-4">
          <div className="flex gap-2">
            <Button onClick={handleSave} className="flex-1">
              Save Preferences
            </Button>
            <Button onClick={handleAcceptAll} variant="outline" className="flex-1">
              Accept All
            </Button>
          </div>
          <p className="text-xs text-center text-muted-foreground">
            For more information, see our{' '}
            <Link to="/privacy" className="text-primary hover:underline" onClick={onClose}>
              Privacy Policy
            </Link>
            {' '}and{' '}
            <Link to="/terms" className="text-primary hover:underline" onClick={onClose}>
              Terms of Use
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
