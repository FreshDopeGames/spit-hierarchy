import { Database } from "lucide-react";
import AdminTabHeader from "./AdminTabHeader";
import VotingDataResetSection from "./VotingDataResetSection";
import MusicBrainzBulkPopulation from "./MusicBrainzBulkPopulation";
import SocialMediaBulkUpdate from "./SocialMediaBulkUpdate";
import DiscographyBulkFetch from "./DiscographyBulkFetch";
import AlbumTracksBulkFetch from "./AlbumTracksBulkFetch";
import WeeklyBlogGenerator from "./WeeklyBlogGenerator";
import CollaborationTools from "./CollaborationTools";

const AdminDataManagement = () => {
  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Data Management"
        icon={Database}
        description="Manage and reset application data"
      />
      
      <div className="space-y-8">
        <WeeklyBlogGenerator />
        <MusicBrainzBulkPopulation />
        <SocialMediaBulkUpdate />
        <DiscographyBulkFetch />
        <AlbumTracksBulkFetch />
        <CollaborationTools />
        <VotingDataResetSection />
      </div>
    </div>
  );
};

export default AdminDataManagement;