import UnifiedProfileHeader from "./UnifiedProfileHeader";
import { PublicProfile } from "@/types/publicProfile";
import GuestProfileCTA from "./GuestProfileCTA";

interface PublicProfileHeaderProps {
  profile: PublicProfile;
  rankingsCount: number;
  isGuest?: boolean;
}

const PublicProfileHeader = ({ profile, rankingsCount, isGuest = false }: PublicProfileHeaderProps) => {
  return (
    <>
      <UnifiedProfileHeader 
        profile={profile}
        rankingsCount={rankingsCount}
        isOwnProfile={false}
      />
      
      {isGuest && (
        <div className="mt-4">
          <GuestProfileCTA variant="inline" />
        </div>
      )}
    </>
  );
};

export default PublicProfileHeader;
