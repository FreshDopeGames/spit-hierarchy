import { User, Trophy, Calendar, MapPin, Award, Target, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import AvatarDisplay from "@/components/avatar/AvatarDisplay";

interface MemberStats {
  total_votes: number;
  status: string;
  consecutive_voting_days: number;
  total_comments?: number;
  ranking_lists_created?: number;
  top_five_created?: number;
}

interface ProfileData {
  id: string;
  username: string;
  created_at: string;
  member_stats: MemberStats | null;
  bio?: string | null;
  location?: string | null;
  avatar_url?: string | null;
}

interface UnifiedProfileHeaderProps {
  profile: ProfileData;
  rankingsCount: number;
  isOwnProfile?: boolean;
  onEditAvatar?: () => void;
}

const UnifiedProfileHeader = ({ 
  profile, 
  rankingsCount, 
  isOwnProfile = false,
  onEditAvatar 
}: UnifiedProfileHeaderProps) => {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'diamond': return 'bg-blue-500/20 text-blue-400 border-blue-400/30';
      case 'platinum': return 'bg-gray-300/20 text-gray-300 border-gray-300/30';
      case 'gold': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      case 'silver': return 'bg-gray-400/20 text-gray-400 border-gray-400/30';
      default: return 'bg-orange-600/20 text-orange-400 border-orange-400/30';
    }
  };

  const formatStatus = (status?: string) => {
    if (!status) return 'Bronze';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const getVoteMultiplier = (status?: string) => {
    switch (status) {
      case 'diamond': return 5;
      case 'platinum': return 4;
      case 'gold': return 3;
      case 'silver': return 2;
      default: return 1;
    }
  };

  const getNextStatusThreshold = (status?: string) => {
    switch (status) {
      case 'bronze': return { next: 'Silver', threshold: 100 };
      case 'silver': return { next: 'Gold', threshold: 300 };
      case 'gold': return { next: 'Platinum', threshold: 600 };
      case 'platinum': return { next: 'Diamond', threshold: 1000 };
      default: return null;
    }
  };

  const calculateProgress = () => {
    const stats = profile.member_stats;
    if (!stats) return 0;
    
    const nextStatus = getNextStatusThreshold(stats.status);
    if (!nextStatus) return 100; // Already at max level
    
    const currentPoints = (stats.total_votes || 0) + 
                         ((stats.total_comments || 0) * 2) + 
                         ((stats.ranking_lists_created || 0) * 10) +
                         ((stats.top_five_created || 0) * 5);
    
    return Math.min((currentPoints / nextStatus.threshold) * 100, 100);
  };

  const nextStatus = getNextStatusThreshold(profile.member_stats?.status);
  const progress = calculateProgress();

  return (
    <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            <AvatarDisplay 
              avatarUrl={profile.avatar_url} 
              size="xlarge" 
            />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-rap-platinum font-mogra mb-2">
              {profile.username}
            </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-4">
              <Badge className={`font-kaushan border ${getStatusColor(profile.member_stats?.status)}`}>
                <Trophy className="w-3 h-3 mr-1" />
                {formatStatus(profile.member_stats?.status)} Member
              </Badge>
              <div className="flex items-center gap-1 text-rap-smoke font-kaushan text-sm">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-rap-gold font-kaushan text-sm">
                <Target className="w-4 h-4" />
                {getVoteMultiplier(profile.member_stats?.status)}x Vote Multiplier
              </div>
            </div>

            {/* Member Progress */}
            {nextStatus && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-rap-smoke font-kaushan mb-2">
                  <span>Progress to {nextStatus.next}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-rap-carbon-light">
                  <div 
                    className="h-full bg-gradient-to-r from-rap-gold-dark to-rap-gold-light transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </Progress>
              </div>
            )}

            {/* Additional profile info */}
            <div className="space-y-2">
              {profile.bio && (
                <p className="text-rap-platinum font-kaushan text-sm max-w-2xl">
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-rap-smoke font-kaushan text-sm">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-rap-smoke/20 pt-6">
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rap-gold font-mogra mb-1">
              {profile.member_stats?.total_votes || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-xs md:text-sm">Total Votes Cast</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rap-gold font-mogra mb-1">
              {rankingsCount}
            </div>
            <div className="text-rap-smoke font-kaushan text-xs md:text-sm">Public Rankings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rap-gold font-mogra mb-1">
              {profile.member_stats?.consecutive_voting_days || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-xs md:text-sm">Day Voting Streak</div>
          </div>
          <div className="text-center">
            <div className="text-2xl md:text-3xl font-bold text-rap-gold font-mogra mb-1">
              {profile.member_stats?.total_comments || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-xs md:text-sm">Comments Posted</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnifiedProfileHeader;