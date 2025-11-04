import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Settings } from 'lucide-react';
import { CookiePreferencesModal } from '@/components/CookiePreferencesModal';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export const CookieSettingsLink = () => {
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  return (
    <>
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="fixed bottom-4 left-4 z-[9998] bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-black))] p-3 rounded-full shadow-lg hover:bg-[hsl(var(--theme-primaryLight))] transition-all hover:scale-110"
            aria-label="Cookie Settings"
            onClick={() => setIsPreferencesOpen(true)}
          >
            <Settings className="h-5 w-5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="right" className="w-auto p-2">
          <p className="text-sm font-semibold">Cookie Settings</p>
        </PopoverContent>
      </Popover>

      <CookiePreferencesModal
        isOpen={isPreferencesOpen}
        onClose={() => setIsPreferencesOpen(false)}
      />
    </>
  );
};
