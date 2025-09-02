
import TopMembersCards from "./TopMembersCards";

const MemberAnalytics = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="font-ceviche text-primary mb-3 sm:mb-4 text-4xl sm:text-6xl">
        Community Members
      </h3>

      <TopMembersCards />
    </div>
  );
};

export default MemberAnalytics;
