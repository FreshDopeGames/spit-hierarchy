import { useSecureAuth } from "@/hooks/useSecureAuth";
import { useVoterGeolocation } from "@/hooks/useVoterGeolocation";

const VoterGeolocationTracker = () => {
  const { user } = useSecureAuth();
  useVoterGeolocation(user?.id);
  return null;
};

export default VoterGeolocationTracker;
