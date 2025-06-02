
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";

interface BlogArticleContentProps {
  content: string;
}

const BlogArticleContent = ({ content }: BlogArticleContentProps) => {
  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-8">
        <div 
          className="prose prose-invert prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
