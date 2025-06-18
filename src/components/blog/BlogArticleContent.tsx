
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { marked } from "marked";
import { useMemo } from "react";

interface BlogArticleContentProps {
  content: string;
}

const BlogArticleContent = ({ content }: BlogArticleContentProps) => {
  const htmlContent = useMemo(() => {
    // Configure marked options for better rendering
    marked.setOptions({
      breaks: true,
      gfm: true,
    });
    
    return marked(content);
  }, [content]);

  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-8">
        <div 
          className="prose prose-invert prose-lg max-w-none prose-headings:text-rap-gold prose-p:text-rap-platinum prose-strong:text-rap-gold prose-em:text-rap-silver prose-code:text-rap-gold prose-code:bg-rap-carbon/50 prose-pre:bg-rap-carbon prose-blockquote:border-rap-gold prose-blockquote:text-rap-silver prose-ul:text-rap-platinum prose-ol:text-rap-platinum prose-li:text-rap-platinum"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
