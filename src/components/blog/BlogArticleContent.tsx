
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

    // Custom renderer for better formatting
    const renderer = new marked.Renderer();
    
    // Enhanced paragraph renderer with proper spacing
    renderer.paragraph = (text) => {
      return `<p class="mb-6 leading-relaxed text-rap-platinum">${text}</p>`;
    };
    
    // Enhanced list item renderer for better bullet points
    renderer.listitem = (text) => {
      return `<li class="mb-3 leading-relaxed text-rap-platinum pl-2 relative before:content-['•'] before:text-rap-gold before:font-bold before:absolute before:-left-4">${text}</li>`;
    };

    // Enhanced blockquote renderer
    renderer.blockquote = (quote) => {
      return `<blockquote class="border-l-4 border-rap-gold pl-6 py-4 mb-8 italic text-rap-silver bg-rap-carbon/30 rounded-r-lg font-merienda">${quote}</blockquote>`;
    };

    // Enhanced heading renderers for emoji headings
    renderer.heading = (text, level) => {
      const headingClasses = {
        1: "text-4xl md:text-5xl font-ceviche text-rap-gold mb-8 mt-12 leading-tight",
        2: "text-3xl md:text-4xl font-ceviche text-rap-gold mb-6 mt-10 leading-tight",
        3: "text-2xl md:text-3xl font-ceviche text-rap-gold mb-5 mt-8 leading-tight",
        4: "text-xl md:text-2xl font-ceviche text-rap-gold mb-4 mt-6 leading-tight",
        5: "text-lg md:text-xl font-ceviche text-rap-gold mb-4 mt-6 leading-tight",
        6: "text-base md:text-lg font-ceviche text-rap-gold mb-4 mt-6 leading-tight"
      };
      
      return `<h${level} class="${headingClasses[level] || headingClasses[3]} [&>*:first-child]:mt-0">${text}</h${level}>`;
    };

    // Enhanced list renderer for proper spacing
    renderer.list = (body, ordered) => {
      const tag = ordered ? 'ol' : 'ul';
      const classes = ordered ? 
        "list-decimal list-outside ml-6 mb-8 space-y-3" : 
        "list-none ml-6 mb-8 space-y-3";
      
      return `<${tag} class="${classes}">${body}</${tag}>`;
    };

    marked.setOptions({ renderer });
    
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
          [&_ul]:list-none [&_ul]:ml-0 [&_ul_li]:relative [&_ul_li]:pl-6
          [&_ul_li::before]:content-['•'] [&_ul_li::before]:text-rap-gold [&_ul_li::before]:font-bold [&_ul_li::before]:absolute [&_ul_li::before]:left-0"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
