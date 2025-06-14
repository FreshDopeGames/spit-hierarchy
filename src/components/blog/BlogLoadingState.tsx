
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

const BlogLoadingState = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <Card key={i} className="bg-carbon-fiber border border-rap-gold/40 animate-pulse">
          <div className="aspect-video bg-rap-carbon rounded-t-lg"></div>
          <CardContent className="p-6">
            <div className="h-4 bg-rap-carbon rounded mb-2"></div>
            <div className="h-6 bg-rap-carbon rounded mb-4"></div>
            <div className="h-16 bg-rap-carbon rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default BlogLoadingState;
