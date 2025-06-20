
import { User, Trophy, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicProfile } from "@/types/publicProfile";

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  rankingsCount: number;
}

const PublicProfileHeader = ({ profile, rankingsCount }: PublicProfileHeaderProps) => {
  return (
    <Card className="bg-carbon-fiber border-rap-burgundy/40 mb-8">
      <CardContent className="p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rap-gold-dark via-rap-gold to-rap-gold-light flex items-center justify-center">
            <User className="w-8 h-8 text-rap-carbon" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-rap-platinum font-mogra">
              {profile.username}
            </h1>
            {profile.full_name && (
              <p className="text-rap-smoke font-kaushan text-lg">
                {profile.full_name}
              </p>
            )}
            <div className="flex items-center gap-4 mt-2">
              <Badge className={`font-kaushan ${
                profile.member_stats?.status === 'diamond' ? 'bg-blue-500/20 text-blue-400' :
                profile.member_stats?.status === 'platinum' ? 'bg-gray-300/20 text-gray-300' :
                profile.member_stats?.status === 'gold' ? 'bg-yellow-500/20 text-yellow-400' :
                profile.member_stats?.status === 'silver' ? 'bg-gray-400/20 text-gray-400' :
                'bg-orange-600/20 text-orange-400'
              }`}>
                <Trophy className="w-3 h-3 mr-1" />
                {profile.member_stats?.status || 'Bronze'} Member
              </Badge>
              <div className="flex items-center gap-1 text-rap-smoke font-kaushan text-sm">
                <Calendar className="w-4 h-4" />
                Joined {new Date(profile.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-rap-smoke/20 pt-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-rap-gold font-mogra">
              {profile.member_stats?.total_votes || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Total Votes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rap-gold font-mogra">
              {rankingsCount}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Public Rankings</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-rap-gold font-mogra">
              {profile.member_stats?.consecutive_voting_days || 0}
            </div>
            <div className="text-rap-smoke font-kaushan text-sm">Voting Streak</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PublicProfileHeader;
