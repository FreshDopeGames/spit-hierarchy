import React, { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import top5GuideImage from "@/assets/top5-guide.png";

const TopFiveGuideOverlay = () => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const shouldShow = localStorage.getItem('show-top5-guide');
    if (shouldShow === 'true') {
      localStorage.removeItem('show-top5-guide');
      // Scroll to My Top 5 section
      const el = document.getElementById('my-top-5');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      // Show overlay after a short delay for scroll to complete
      const timer = setTimeout(() => setIsOpen(true), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className="max-w-[95vw] sm:max-w-lg p-0 gap-0 overflow-hidden [&>button]:hidden"
        style={{
          backgroundColor: 'hsl(var(--theme-surface))',
          border: '2px solid hsl(var(--theme-primary))',
          borderRadius: '12px'
        }}
      >
        <div className="p-4 sm:p-6 md:p-8 text-center">
          <h2 
            className="text-xl sm:text-2xl font-bold mb-4"
            style={{ 
              color: 'hsl(var(--theme-text))',
              fontFamily: 'var(--theme-font-heading)'
            }}
          >
            Select Your Top 5
          </h2>

          <div className="mb-4 rounded-lg overflow-hidden border border-[hsl(var(--theme-border))]">
            <img 
              src={top5GuideImage} 
              alt="How to select your Top 5 rappers" 
              className="w-full h-auto"
            />
          </div>

          <p 
            className="text-sm sm:text-base mb-6"
            style={{ color: 'hsl(var(--theme-textMuted))' }}
          >
            Now it's time to pick your Top 5 rappers. You can change this anytime, and other users will be able to see this when they visit your profile.
          </p>

          <Button
            onClick={() => setIsOpen(false)}
            style={{
              backgroundColor: 'hsl(var(--theme-primary))',
              color: 'hsl(var(--theme-textLight))'
            }}
            className="px-8 py-3 text-base sm:text-lg hover:opacity-90"
          >
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TopFiveGuideOverlay;
