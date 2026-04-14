import UsernameEnforcementModal from "@/components/auth/UsernameEnforcementModal";
import VoterGeolocationTracker from "@/components/VoterGeolocationTracker";
import ActivityToastProvider from "@/components/ActivityToastProvider";

const DeferredAuthComponents = () => {
  return (
    <>
      <UsernameEnforcementModal />
      <VoterGeolocationTracker />
      <ActivityToastProvider />
    </>
  );
};

export default DeferredAuthComponents;
