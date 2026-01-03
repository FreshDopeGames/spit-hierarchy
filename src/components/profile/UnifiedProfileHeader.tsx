import { User, Trophy, Calendar, MapPin, Award, Target, TrendingUp } from "lucide-react";
import { ThemedCard as Card, ThemedCardContent as CardContent } from "@/components/ui/themed-card";
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
  // Public profile stats
  rappers_ranked?: number;
  rappers_rated?: number;
  bars_upvotes?: number;
  quiz_questions_answered?: number;
  quiz_correct_answers?: number;
  vs_match_votes?: number;
  total_achievements?: number;
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
      case 'diamond': return 'bg-[var(--theme-accent)]/20 text-[var(--theme-accent)] border-[var(--theme-accent)]/30';
      case 'platinum': return 'bg-[var(--theme-secondary)]/20 text-[var(--theme-secondary)] border-[var(--theme-secondary)]/30';
      case 'gold': return 'bg-[var(--theme-primary)]/20 text-[var(--theme-primary)] border-[var(--theme-primary)]/30';
      case 'silver': return 'bg-[var(--theme-textMuted)]/20 text-[var(--theme-textMuted)] border-[var(--theme-textMuted)]/30';
      default: return 'bg-[var(--theme-primaryDark)]/20 text-[var(--theme-primaryDark)] border-[var(--theme-primaryDark)]/30';
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
      case 'bronze': return { next: 'Silver', threshold: 250 };
      case 'silver': return { next: 'Gold', threshold: 750 };
      case 'gold': return { next: 'Platinum', threshold: 1500 };
      case 'platinum': return { next: 'Diamond', threshold: 3000 };
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
    <Card className="bg-black border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20 mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          <div className="flex-shrink-0">
            <AvatarDisplay 
              avatarUrl={profile.avatar_url} 
              size="xlarge" 
            />
          </div>
          <div className="text-center md:text-left flex-1">
        <h1 className="text-3xl md:text-4xl font-bold font-mogra text-yellow-600 mb-2">
          {profile.username}
        </h1>
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-4">
              <Badge className={`font-[var(--theme-font-body)] border ${getStatusColor(profile.member_stats?.status)}`}>
                <Trophy className="w-3 h-3 mr-1" />
                {formatStatus(profile.member_stats?.status)} Member
              </Badge>
              <div className="flex items-center gap-1 text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-sm">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1 text-[var(--theme-primary)] font-[var(--theme-font-body)] text-sm">
                <Target className="w-4 h-4" />
                {getVoteMultiplier(profile.member_stats?.status)}x Vote Multiplier
              </div>
            </div>

            {/* Member Progress - Only show on own profile */}
            {isOwnProfile && nextStatus && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)] mb-2">
                  <span>Progress to {nextStatus.next}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2 bg-[var(--theme-background)]">
                  <div 
                    className="h-full bg-gradient-to-r from-[var(--theme-primaryDark)] to-[var(--theme-primaryLight)] transition-all duration-300" 
                    style={{ width: `${progress}%` }}
                  />
                </Progress>
              </div>
            )}

            {/* Additional profile info */}
            <div className="space-y-2">
              {profile.bio && (
                <p className="text-[var(--theme-text)] font-[var(--theme-font-body)] text-sm max-w-2xl">
                  {profile.bio}
                </p>
              )}
              {profile.location && (
                <div className="flex items-center justify-center md:justify-start gap-1 text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-sm">
                  <MapPin className="w-4 h-4" />
                  {profile.location}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        {!isOwnProfile && profile.member_stats?.rappers_ranked !== undefined ? (
          // Public profile stats
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 border-t border-[var(--theme-textMuted)]/20 pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.rappers_ranked || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Rappers Ranked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.rappers_rated || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Rappers Rated</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.bars_upvotes || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Bars</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.quiz_questions_answered || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Quiz Questions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.quiz_questions_answered 
                  ? `${Math.round((profile.member_stats.quiz_correct_answers || 0) / profile.member_stats.quiz_questions_answered * 100)}%`
                  : '—'}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Quiz Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.vs_match_votes || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">VS Match Votes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.total_achievements || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Total Achievements</div>
            </div>
          </div>
        ) : (
          // Self-profile stats
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-[var(--theme-textMuted)]/20 pt-6">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.total_votes || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Total Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {rankingsCount}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Public Rankings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.consecutive_voting_days || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Day Voting Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-[var(--theme-primary)] font-[var(--theme-font-heading)] mb-1">
                {profile.member_stats?.total_comments || 0}
              </div>
              <div className="text-[var(--theme-textMuted)] font-[var(--theme-font-body)] text-xs md:text-sm">Comments Posted</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UnifiedProfileHeader;