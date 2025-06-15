
import React from "react";
import { Crown, Star } from "lucide-react";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { Progress } from "@/components/ui/progress";

interface MemberStatusCardProps {
  memberStats: any;
}

const MemberStatusCard = ({ memberStats }: MemberStatusCardProps) => {
  const { 
    currentStatus, 
    totalPoints, 
    getProgressToNextLevel, 
    getVoteMultiplier, 
    getStatusColor 
  } = useMemberStatus();

  if (!memberStats) return null;

  const progress = getProgressToNextLevel();
  const voteMultiplier = getVoteMultiplier();

  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg shadow-rap-gold/20">
      <div className="flex items-center justify-center">
        <div className="text-center w-full">
          <div className="flex items-center justify-center mb-2">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-rap-gold mr-2" />
            <h3 className="text-lg sm:text-xl font-bold text-rap-gold font-merienda">
              Member Status
            </h3>
          </div>
          
          <div className={`text-2xl sm:text-4xl font-extrabold font-merienda capitalize ${getStatusColor(currentStatus)} mb-3`}>
            {currentStatus}
          </div>

          {/* Vote Multiplier Badge */}
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-rap-gold to-rap-silver px-3 py-1 rounded-full">
              <div className="flex items-center gap-1 text-rap-carbon font-bold text-sm">
                <Star className="w-4 h-4" />
                <span>{voteMultiplier}x Vote Power</span>
              </div>
            </div>
          </div>

          {/* Points Display */}
          <div className="text-center mb-4">
            <div className="text-rap-platinum text-sm font-merienda">
              Achievement Points
            </div>
            <div className="text-rap-gold font-bold text-xl font-merienda">
              {totalPoints}
            </div>
          </div>

          {/* Progress to Next Level */}
          {progress.nextLevel && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-rap-platinum font-merienda">
                  Progress to {progress.nextLevel}
                </span>
                <span className="text-rap-gold font-merienda font-bold">
                  {progress.pointsToNext} points needed
                </span>
              </div>
              <Progress 
                value={progress.percentage} 
                className="w-full bg-rap-carbon"
              />
              <div className="text-xs text-rap-smoke text-center font-merienda">
                {Math.round(progress.percentage)}% complete
              </div>
            </div>
          )}

          {currentStatus === 'diamond' && (
            <div className="text-sm text-cyan-400 font-merienda font-bold mt-2">
              🎉 Maximum level achieved!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberStatusCard;
