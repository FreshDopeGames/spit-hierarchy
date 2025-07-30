import { useFeaturedPolls } from "@/hooks/usePolls";
import PollWidget from "./PollWidget";
const HomepagePoll = () => {
  const {
    data: polls,
    isLoading
  } = useFeaturedPolls();
  if (isLoading || !polls || polls.length === 0) {
    return null;
  }
  return <section className="py-16 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8 font-ceviche ">
          <h2 className="font-bold mb-4 font-ceviche text-rap-gold ">Community Polls</h2>
          <p className="text-muted-foreground">
            Share your opinion and see what the community thinks
          </p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {polls.map(poll => <PollWidget key={poll.id} poll={poll} />)}
        </div>
      </div>
    </section>;
};
export default HomepagePoll;