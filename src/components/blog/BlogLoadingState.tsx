
import React from 'react';
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";

const BlogLoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-gray-800 border border-gray-700 animate-pulse">
          <div className="aspect-video bg-gray-700 rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="h-4 bg-gray-600 rounded mb-2"></div>
            <div className="h-6 bg-gray-500 rounded mb-4"></div>
            <div className="h-16 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogLoadingState;
