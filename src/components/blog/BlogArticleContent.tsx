import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { useMemo } from "react";

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

        // Convert headings to bold text with line breaks
        .replace(/^#{1,6}\s+(.+)$/gm, "<strong>$1</strong><br><br>")

        // Convert unordered lists to inline text with rap-gold bullet characters
        .replace(/^\s*[-*+]\s+(.+)$/gm, '<span class="text-rap-gold">●</span> $1<br>')

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

        // Convert single line breaks to <br> tags, but preserve double line breaks as paragraph spacing
        .replace(/\n{3,}/g, "<br><br><br>") // Multiple line breaks
        .replace(/\n{2}/g, "<br><br>") // Double line breaks
        .replace(/\n/g, "<br>") // Single line breaks

        // Clean up excessive line breaks
        .replace(/(<br>\s*){4,}/g, "<br><br><br>")

        // Clean up any remaining whitespace issues
        .trim();

      return processed;
    };

    return processContentAsSingleParagraph(content);
  }, [content]);

  return (
    <ThemedCard className="mb-8">
      <ThemedCardContent className="p-8 bg-black overflow-hidden border-4">
        <div className="font-merienda">
          <p
            className="text-rap-platinum leading-relaxed text-base
            [&_strong]:font-bold
            [&_em]:text-rap-silver [&_em]:italic
            [&_br]:block [&_br]:my-2"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
