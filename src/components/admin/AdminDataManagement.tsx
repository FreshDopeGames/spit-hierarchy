import { Database } from "lucide-react";
import AdminTabHeader from "./AdminTabHeader";
import VotingDataResetSection from "./VotingDataResetSection";
import MusicBrainzBulkPopulation from "./MusicBrainzBulkPopulation";
import DiscographyBulkFetch from "./DiscographyBulkFetch";

const AdminDataManagement = () => {
  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Data Management"
        icon={Database}
        description="Manage and reset application data"
      />
      
      <div className="space-y-8">
        <MusicBrainzBulkPopulation />
        <DiscographyBulkFetch />
        <VotingDataResetSection />
      </div>
    </div>
  );
};

export default AdminDataManagement;