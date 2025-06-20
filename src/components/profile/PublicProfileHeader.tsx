
import { User, Trophy, Calendar, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicProfile } from "@/types/publicProfile";

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  rankingsCount: number;
}

const PublicProfileHeader = ({ profile, rankingsCount }: PublicProfileHeaderProps) => {
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

  return (
    <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light flex items-center justify-center flex-shrink-0">
            <User className="w-10 h-10 text-rap-carbon" />
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-rap-platinum font-mogra mb-2">
              {profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-rap-smoke font-kaushan text-lg md:text-xl mb-3">
                {profile.full_name}
              </p>
            )}
            
            <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 mb-4">
              <Badge className={`font-kaushan border ${getStatusColor(profile.member_stats?.status)}`}>
                <Trophy className="w-3 h-3 mr-1" />
                {formatStatus(profile.member_stats?.status)} Member
              </Badge>
              <div className="flex items-center gap-1 text-rap-smoke font-kaushan text-sm">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-rap-smoke/20 pt-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-gold font-mogra mb-1">
              {profile.member_stats?.total_votes || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Total Votes Cast</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-gold font-mogra mb-1">
              {rankingsCount}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Public Rankings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-rap-gold font-mogra mb-1">
              {profile.member_stats?.consecutive_voting_days || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Day Voting Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicProfileHeader;
