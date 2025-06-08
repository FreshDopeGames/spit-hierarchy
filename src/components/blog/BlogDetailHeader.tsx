import { Link } from "react-router-dom";
import { ThemedButton } from "@/components/ui/themed-button";
import { ArrowLeft, Twitter, Facebook, Link as LinkIcon } from "lucide-react";
interface BlogDetailHeaderProps {
  onShare: (platform: string) => void;
}
const BlogDetailHeader = ({
  onShare
}: BlogDetailHeaderProps) => {
  return <header className="bg-[var(--theme-backgroundDark)]/40 border-b border-[var(--theme-border)] p-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/">
          <ThemedButton variant="ghost" className="text-[var(--theme-primary)] hover:text-[var(--theme-textLight)]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </ThemedButton>
        </Link>
        
        <div className="flex items-center gap-2">
          
          
          
        </div>
      </div>
    </header>;
};
export default BlogDetailHeader;