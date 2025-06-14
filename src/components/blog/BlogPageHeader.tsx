
import React from 'react';

interface BlogPageHeaderProps {
  title: string;
}

const BlogPageHeader = ({ title }: BlogPageHeaderProps) => {
  return (
    <h1 className="text-6xl font-ceviche text-rap-gold text-center mb-12">
      {title}
    </h1>
  );
};

export default BlogPageHeader;
