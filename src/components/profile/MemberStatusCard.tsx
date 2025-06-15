
import React from "react";
import { Crown } from "lucide-react";

interface MemberStatusCardProps {
  memberStats: any;
}

const MemberStatusCard = ({ memberStats }: MemberStatusCardProps) => {
  if (!memberStats) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'platinum':
        return 'text-rap-platinum';
      case 'gold':
        return 'text-rap-gold';
      case 'silver':
        return 'text-rap-silver';
      case 'bronze':
      default:
        return 'text-amber-600';
    }
  };

  return (
    <div className="bg-carbon-fiber/90 border border-rap-gold/30 rounded-lg p-4 sm:p-6 mb-4 sm:mb-6 shadow-lg shadow-rap-gold/20">
      <div className="flex items-center justify-center">
        <div className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Crown className="w-6 h-6 sm:w-8 sm:h-8 text-rap-gold mr-2" />
            <h3 className="text-lg sm:text-xl font-bold text-rap-gold font-merienda">
              Member Status
            </h3>
          </div>
          <div className={`text-2xl sm:text-4xl font-extrabold font-merienda capitalize ${getStatusColor(memberStats.status)}`}>
            {memberStats.status || 'Bronze'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberStatusCard;
