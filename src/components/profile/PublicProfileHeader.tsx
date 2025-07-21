
import UnifiedProfileHeader from "./UnifiedProfileHeader";
import { PublicProfile } from "@/types/publicProfile";

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  rankingsCount: number;
}

const PublicProfileHeader = ({ profile, rankingsCount }: PublicProfileHeaderProps) => {
  return (
    <UnifiedProfileHeader 
      profile={profile}
      rankingsCount={rankingsCount}
      isOwnProfile={false}
    />
  );
};

export default PublicProfileHeader;
