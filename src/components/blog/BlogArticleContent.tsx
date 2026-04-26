import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { useMemo } from "react";
import DOMPurify from "dompurify";

interface BlogArticleContentProps {
  content: string;
}

const BlogArticleContent = ({ content }: BlogArticleContentProps) => {
  const processedContent = useMemo(() => {
    const processContentAsSingleParagraph = (rawContent: string) => {
      let processed = rawContent
        // Normalize line breaks
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        // Convert headings to styled heading spans (without trailing line breaks)
        .replace(/^#{1,6}\s+(.+)$/gm, '<span class="heading">$1</span>')
        
        // Normalize multiple line breaks after headings to exactly one (preserves start-of-line for list items)
        .replace(/(<span class="heading">.*?<\/span>)\n+/g, '$1\n')

        // Convert unordered lists to inline text with rap-gold bullet characters and proper spacing
        .replace(/^\s*[-*+]\s+(.+)$/gm, '<span class="list-item"><span class="text-rap-gold">●</span> $1</span>')

        // Convert ordered lists to inline text with numbers
        .replace(/^\s*\d+\.\s+(.+)$/gm, (match, text, offset, string) => {
          const beforeMatch = string.substring(0, offset);
          const listNumber = (beforeMatch.match(/^\s*\d+\.\s+/gm) || []).length + 1;
          return `${listNumber}. ${text}<br>`;
        })

        // Convert **bold** to <strong>
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

        // Convert *italic* to <em>
        .replace(/\*(.+?)\*/g, "<em>$1</em>")

        // Convert [text](url) markdown links to anchor tags
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

        // Convert single line breaks to <br> tags, but preserve double line breaks as paragraph spacing
        .replace(/\n{3,}/g, "<br><br><br>") // Multiple line breaks
        .replace(/\n{2}/g, "<br><br>") // Double line breaks
        .replace(/\n/g, "<br>") // Single line breaks

        // Clean up excessive line breaks
        .replace(/(<br>\s*){4,}/g, "<br><br><br>")

        // Remove <br> tags inserted between consecutive list items (keeps spacing after the whole list)
        .replace(/(<\/span>)(\s*<br>\s*)+(?=<span class="list-item">)/g, "$1")

        // Collapse <br> tags that follow the final list item in a list (keep one for spacing)
        .replace(/(<span class="list-item">[\s\S]*?<\/span>)(\s*<br>\s*){2,}/g, "$1<br>")

        // No post-list indentation wrapping — content after lists returns to normal indentation

        // Clean up any remaining whitespace issues
        .trim();

      return processed;
    };

    const processed = processContentAsSingleParagraph(content);
    return DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'span', 'ol', 'ul', 'li'],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
    });
  }, [content]);

  return (
    <ThemedCard id="article-content" variant="dark" className="mb-8">
      <ThemedCardContent className="p-4 sm:p-8">
        <div className="font-merienda">
        <p
            className="text-rap-platinum leading-relaxed text-base
            [&_strong]:font-bold
            [&_em]:text-rap-silver [&_em]:italic
            [&_br]:block [&_br]:my-0
            [&_a]:font-bold [&_a]:text-[hsl(var(--theme-primary))] [&_a]:underline [&_a]:underline-offset-2 [&_a]:hover:opacity-80 [&_a]:transition-opacity
            [&_.heading]:block [&_.heading]:text-xl [&_.heading]:font-bold [&_.heading]:mt-6 [&_.heading]:mb-2
            [&_.list-item]:block [&_.list-item]:mt-1 [&_.list-item]:mb-0 [&_.list-item]:pl-6 [&_.list-item]:-indent-4"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
