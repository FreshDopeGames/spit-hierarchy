
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Target, Lock } from "lucide-react";

interface AchievementEmptyStateProps {
  type: 'earned' | 'progress' | 'locked';
}

const AchievementEmptyState = ({ type }: AchievementEmptyStateProps) => {
  const config = {
    earned: {
      icon: Trophy,
      title: "No Achievements Yet",
      description: "Start voting and engaging with the community to unlock your first achievements!"
    },
    progress: {
      icon: Target,
      title: "No Progress Yet",
      description: "Start engaging with the platform to make progress toward achievements!"
    },
    locked: {
      icon: Lock,
      title: "All Achievements Started!",
      description: "You've made progress on all available achievements. Keep going!"
    }
  };

  const { icon: Icon, title, description } = config[type];

  return (
    <Card className="bg-black/40 border-2 border-rap-gold">
      <CardContent className="p-4 sm:p-6 text-center">
        <Icon className="w-12 h-12 sm:w-16 sm:h-16 text-rap-gold/50 mx-auto mb-4" />
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400 text-sm sm:text-base px-4">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};

export default AchievementEmptyState;
