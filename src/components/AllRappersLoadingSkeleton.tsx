
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const AllRappersLoadingSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="bg-black/40 border-purple-500/20 animate-pulse">
          <CardContent className="p-6">
            <div className="h-32 bg-gray-700 rounded-lg mb-4"></div>
            <div className="h-4 bg-gray-700 rounded mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-3/4"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AllRappersLoadingSkeleton;
