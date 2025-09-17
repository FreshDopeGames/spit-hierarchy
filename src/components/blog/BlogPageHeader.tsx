
import React from 'react';
import { useEnhancedTheme } from '@/hooks/useEnhancedTheme';

interface BlogPageHeaderProps {
  title: string;
}

const BlogPageHeader = ({ title }: BlogPageHeaderProps) => {
  const { theme } = useEnhancedTheme();

  return (
    <h1 className="text-6xl font-ceviche text-center mb-12 text-[hsl(var(--theme-primary))]">
      {title}
    </h1>
  );
};

export default BlogPageHeader;
