
import TopMembersCards from "./TopMembersCards";

const MemberAnalytics = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-rap-gold mb-3 sm:mb-4 font-thin sm:text-6xl text-4xl">
        Community Members
      </h3>

      <TopMembersCards />
    </div>
  );
};

export default MemberAnalytics;
