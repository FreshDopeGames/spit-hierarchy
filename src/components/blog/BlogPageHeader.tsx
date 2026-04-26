
import React from 'react';
import { useEnhancedTheme } from '@/hooks/useEnhancedTheme';

interface BlogPageHeaderProps {
  title: string;
  showMemberJournalsLink?: boolean;
}

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const el = document.getElementById('member-journals');
  if (el) {
    const headerOffset = 80; // global fixed header (h-16 = 64px) + small gap
    const top = el.getBoundingClientRect().top + window.scrollY - headerOffset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
};

const BlogPageHeader = ({ title, showMemberJournalsLink = false }: BlogPageHeaderProps) => {
  const { theme } = useEnhancedTheme();

  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl sm:text-6xl font-ceviche text-[hsl(var(--theme-primary))]">
        {title}
      </h1>
      {showMemberJournalsLink && (
        <a
          href="#member-journals"
          onClick={handleAnchorClick}
          className="mt-2 inline-block text-lg sm:text-2xl font-ceviche text-[hsl(var(--theme-primary))]/80 hover:text-[hsl(var(--theme-primary))] underline underline-offset-4 transition-colors"
        >
          And Member Journals
        </a>
      )}
    </header>
  );
};

export default BlogPageHeader;
