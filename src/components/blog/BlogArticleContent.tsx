
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
      breaks: true, // Convert single line breaks to <br>
      gfm: true, // GitHub Flavored Markdown
      pedantic: false, // Be more forgiving with markdown parsing
    });

    // Custom renderer for better list handling
    const renderer = new marked.Renderer();
    
    // Ensure proper paragraph spacing
    renderer.paragraph = (text) => {
      return `<p class="mb-4 leading-relaxed">${text}</p>`;
    };
    
    // Better list item rendering
    renderer.listitem = (text) => {
      return `<li class="mb-2 leading-relaxed">${text}</li>`;
    };
    
    // Better list rendering - updated to match current marked API
    renderer.list = (token) => {
      const type = token.ordered ? 'ol' : 'ul';
      const className = token.ordered 
        ? 'list-decimal list-inside mb-6 space-y-2 pl-4' 
        : 'list-disc list-inside mb-6 space-y-2 pl-4';
      return `<${type} class="${className}">${token.items.map(item => renderer.listitem(item.text)).join('')}</${type}>`;
    };

    // Better blockquote rendering
    renderer.blockquote = (quote) => {
      return `<blockquote class="border-l-4 border-rap-gold pl-6 py-2 mb-6 italic text-rap-silver bg-rap-carbon/30 rounded-r-lg">${quote}</blockquote>`;
    };

    marked.setOptions({ renderer });
    
    return marked(content);
  }, [content]);

  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-8">
        <div 
          className="prose prose-invert prose-lg max-w-none 
          prose-headings:text-rap-gold prose-headings:font-ceviche prose-headings:mb-4 prose-headings:mt-8 prose-headings:leading-tight
          prose-p:text-rap-platinum prose-p:mb-4 prose-p:leading-relaxed prose-p:text-base
          prose-strong:text-rap-gold prose-strong:font-bold
          prose-em:text-rap-silver prose-em:italic
          prose-code:text-rap-gold prose-code:bg-rap-carbon/50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-code:text-sm
          prose-pre:bg-rap-carbon prose-pre:border prose-pre:border-rap-smoke/30 prose-pre:rounded-lg prose-pre:p-4 prose-pre:mb-6
          prose-ul:text-rap-platinum prose-ul:mb-6 prose-ul:space-y-2 prose-ul:pl-0
          prose-ol:text-rap-platinum prose-ol:mb-6 prose-ol:space-y-2 prose-ol:pl-0
          prose-li:text-rap-platinum prose-li:mb-2 prose-li:leading-relaxed prose-li:pl-2
          prose-a:text-rap-gold prose-a:underline prose-a:decoration-rap-gold/50 hover:prose-a:decoration-rap-gold
          prose-hr:border-rap-smoke/30 prose-hr:my-8
          [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
