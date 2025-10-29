import { useRef, useCallback } from 'react';

export const useScrollAnchor = () => {
  const anchorRef = useRef<HTMLElement | null>(null);
  const anchorOffsetRef = useRef<number>(0);

  // Set anchor point before loading new content
  const setAnchor = useCallback(() => {
    // Find a stable element to anchor to (preferably the last visible card)
    const cards = document.querySelectorAll('[data-rapper-card]');
    if (cards.length > 0) {
      const lastCard = cards[cards.length - 1] as HTMLElement;
      anchorRef.current = lastCard;
      anchorOffsetRef.current = lastCard.getBoundingClientRect().top + window.scrollY;
      console.log('[ScrollAnchor] Anchor set at:', anchorOffsetRef.current);
    }
  }, []);

  // Restore scroll position after content loads
  const restoreAnchor = useCallback(() => {
    if (anchorRef.current && anchorOffsetRef.current > 0) {
      // Calculate where the anchor element is now
      const currentOffset = anchorRef.current.getBoundingClientRect().top + window.scrollY;
      const delta = currentOffset - anchorOffsetRef.current;
      
      if (Math.abs(delta) > 10) {
        // Scroll was disrupted, restore it
        const currentScroll = window.scrollY;
        const targetScroll = currentScroll - delta;
        console.log('[ScrollAnchor] Restoring scroll from', currentScroll, 'to', targetScroll);
        window.scrollTo({ top: targetScroll, behavior: 'instant' });
      }
      
      // Clear anchor
      anchorRef.current = null;
      anchorOffsetRef.current = 0;
    }
  }, []);

  return { setAnchor, restoreAnchor };
};
