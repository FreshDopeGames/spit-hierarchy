
import React from 'react';
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";

const BlogLoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="bg-black border-4 border-[hsl(var(--theme-primary))] overflow-hidden shadow-xl shadow-[var(--theme-primary)]/20 animate-pulse">
          <div className="aspect-video bg-gray-700"></div>
          <CardContent className="p-6">
            {/* Date + Category badge area */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-4 w-4 bg-gray-600 rounded"></div>
              <div className="h-4 w-24 bg-gray-600 rounded"></div>
              <div className="h-4 w-1 bg-gray-600 rounded"></div>
              <div className="h-5 w-20 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Large title skeleton - multiple lines for text-4xl */}
            <div className="space-y-2 mb-3">
              <div className="h-8 bg-gray-500 rounded"></div>
              <div className="h-8 bg-gray-500 rounded w-5/6"></div>
            </div>
            
            {/* Excerpt skeleton - 3 lines */}
            <div className="space-y-2 mb-4">
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-600 rounded"></div>
              <div className="h-4 bg-gray-600 rounded w-3/4"></div>
            </div>
            
            {/* Tags skeleton */}
            <div className="flex gap-1 mb-4">
              <div className="h-6 w-16 bg-gray-600 rounded-full"></div>
              <div className="h-6 w-20 bg-gray-600 rounded-full"></div>
              <div className="h-6 w-14 bg-gray-600 rounded-full"></div>
            </div>
            
            {/* Button skeleton */}
            <div className="h-10 w-32 bg-gray-600 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogLoadingState;
