
import React from 'react';
import { useEnhancedTheme } from '@/hooks/useEnhancedTheme';

interface BlogPageHeaderProps {
  title: string;
}

const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
  e.preventDefault();
  const el = document.getElementById('member-journals');
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const BlogPageHeader = ({ title }: BlogPageHeaderProps) => {
  const { theme } = useEnhancedTheme();

  return (
    <header className="text-center mb-12">
      <h1 className="text-4xl sm:text-6xl font-ceviche text-[hsl(var(--theme-primary))]">
        {title}
      </h1>
      <a
        href="#member-journals"
        onClick={handleAnchorClick}
        className="mt-2 inline-block text-lg sm:text-2xl font-ceviche text-[hsl(var(--theme-primary))]/80 hover:text-[hsl(var(--theme-primary))] underline underline-offset-4 transition-colors"
      >
        And Member Journals
      </a>
    </header>
  );
};

export default BlogPageHeader;
