
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Music } from "lucide-react";

const AllRappersEmptyState = () => {
  return (
    <Card className="bg-black/40 border-purple-500/20">
      <CardContent className="p-8 text-center">
        <Music className="w-16 h-16 text-purple-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">No Rappers Found</h3>
        <p className="text-gray-400">Try adjusting your search or filter criteria.</p>
      </CardContent>
    </Card>
  );
};

export default AllRappersEmptyState;
