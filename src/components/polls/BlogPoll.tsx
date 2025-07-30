import { usePolls } from "@/hooks/usePolls";
import PollWidget from "./PollWidget";
interface BlogPollProps {
  blogPostId?: string;
}
const BlogPoll = ({
  blogPostId
}: BlogPollProps) => {
  const {
    data: specificPolls
  } = usePolls('specific_blog', blogPostId);
  const {
    data: allBlogPolls
  } = usePolls('all_blogs');
  const polls = [...(specificPolls || []), ...(allBlogPolls || [])];
  if (polls.length === 0) {
    return null;
  }
  return <div className="space-y-6 mt-8">
      <h3 className="font-semibold text-center text-4xl">Community Polls</h3>
      {polls.map(poll => <PollWidget key={poll.id} poll={poll} />)}
    </div>;
};
export default BlogPoll;