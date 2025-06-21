
import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { marked } from "marked";
import { useMemo } from "react";

interface BlogArticleContentProps {
  content: string;
}

const BlogArticleContent = ({ content }: BlogArticleContentProps) => {
  const htmlContent = useMemo(() => {
    // Configure marked with enhanced options for better rendering
    marked.setOptions({
      breaks: true, // Convert single line breaks to <br>
      gfm: true, // GitHub Flavored Markdown
      pedantic: false, // Be more forgiving with markdown parsing
    });

    return marked(content);
  }, [content]);

  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-8">
        <div 
          className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-rap-gold prose-headings:font-ceviche prose-headings:leading-tight
          prose-p:text-rap-platinum prose-p:leading-relaxed prose-p:text-base prose-p:mb-6
          prose-strong:text-rap-gold prose-strong:font-bold
          prose-em:text-rap-silver prose-em:italic
          prose-code:text-rap-gold prose-code:bg-rap-carbon/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-rap-carbon prose-pre:border prose-pre:border-rap-smoke/30 prose-pre:rounded-lg prose-pre:p-4 prose-pre:mb-6
          prose-ul:text-rap-platinum prose-ul:mb-8 prose-ul:space-y-3
          prose-ol:text-rap-platinum prose-ol:mb-8 prose-ol:space-y-3 prose-ol:list-decimal
          prose-li:text-rap-platinum prose-li:leading-relaxed prose-li:mb-3
          prose-a:text-rap-gold prose-a:underline prose-a:decoration-rap-gold/50 hover:prose-a:decoration-rap-gold
          prose-hr:border-rap-smoke/30 prose-hr:my-8
          prose-blockquote:border-l-4 prose-blockquote:border-rap-gold prose-blockquote:pl-6 prose-blockquote:py-4 prose-blockquote:italic prose-blockquote:text-rap-silver prose-blockquote:bg-rap-carbon/30 prose-blockquote:rounded-r-lg
          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0
          [&_h1]:text-4xl [&_h1]:md:text-5xl [&_h1]:mb-8 [&_h1]:mt-12
          [&_h2]:text-3xl [&_h2]:md:text-4xl [&_h2]:mb-6 [&_h2]:mt-10
          [&_h3]:text-2xl [&_h3]:md:text-3xl [&_h3]:mb-5 [&_h3]:mt-8
          [&_ul]:list-disc [&_ul]:ml-6 [&_ul_li]:relative [&_ul_li]:pl-0
          [&_ul_li::marker]:text-rap-gold [&_ul_li::marker]:content-['•']
          font-merienda"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
