import { ThemedCard, ThemedCardContent } from "@/components/ui/themed-card";
import { useMemo } from "react";
import DOMPurify from "dompurify";

interface BlogArticleContentProps {
  content: string;
}

// ---- Embed URL helpers ----
const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const youTubeId = (url: string): string | null => {
  const patterns = [
    /(?:youtube\.com\/watch\?[^"]*v=)([\w-]{11})/,
    /(?:youtu\.be\/)([\w-]{11})/,
    /(?:youtube\.com\/(?:embed|shorts)\/)([\w-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
};

const buildEmbed = (kind: string, rawUrl: string): string => {
  const url = rawUrl.trim();
  const safe = escapeAttr(url);

  if (kind === "youtube") {
    const id = youTubeId(url);
    if (!id) return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    return `<span class="embed-block"><iframe src="https://www.youtube-nocookie.com/embed/${id}" title="YouTube video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe></span>`;
  }

  if (kind === "video") {
    return `<span class="embed-block"><video src="${safe}" controls preload="metadata" playsinline></video></span>`;
  }

  if (kind === "instagram") {
    // Instagram has an /embed endpoint that works without their JS.
    const cleaned = url.replace(/\/$/, "").replace(/\?.*$/, "");
    return `<span class="embed-block embed-portrait"><iframe src="${escapeAttr(cleaned + "/embed")}" title="Instagram post" allowtransparency="true" allowfullscreen loading="lazy" scrolling="no"></iframe></span>`;
  }

  if (kind === "tiktok") {
    // Extract video id; fall back to link if not parseable.
    const m = url.match(/\/video\/(\d+)/);
    if (!m) return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    return `<span class="embed-block embed-portrait"><iframe src="https://www.tiktok.com/embed/v2/${m[1]}" title="TikTok video" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></span>`;
  }

  if (kind === "twitter") {
    // Use platform.twitter publish embed. Falls back to a clean link.
    return `<span class="embed-block"><blockquote class="twitter-tweet"><a href="${safe}">${safe}</a></blockquote></span>`;
  }

  return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
};

const BlogArticleContent = ({ content }: BlogArticleContentProps) => {
  const processedContent = useMemo(() => {
    const processContentAsSingleParagraph = (rawContent: string) => {
      let processed = rawContent
        // Normalize line breaks
        .replace(/\r\n/g, "\n")
        .replace(/\r/g, "\n")

        // ---- Embeds first (before link processing eats them) ----
        // @[kind](url)
        .replace(/@\[(youtube|video|instagram|tiktok|twitter)\]\(([^)]+)\)/gi, (_m, kind, url) =>
          buildEmbed(String(kind).toLowerCase(), String(url))
        )

        // ![alt](url) images
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_m, alt, url) => {
          return `<img src="${escapeAttr(String(url))}" alt="${escapeAttr(String(alt))}" loading="lazy" />`;
        })

        // Convert headings to styled heading spans (without trailing line breaks)
        .replace(/^#{1,6}\s+(.+)$/gm, '<span class="heading">$1</span>')

        // Normalize multiple line breaks after headings to exactly one
        .replace(/(<span class="heading">.*?<\/span>)\n+/g, "$1\n")

        // Unordered lists
        .replace(/^\s*[-*+]\s+(.+)$/gm, '<span class="list-item"><span class="text-rap-gold">●</span> $1</span>')

        // Ordered lists
        .replace(/^\s*\d+\.\s+(.+)$/gm, (match, text, offset, string) => {
          const beforeMatch = string.substring(0, offset);
          const listNumber = (beforeMatch.match(/^\s*\d+\.\s+/gm) || []).length + 1;
          return `${listNumber}. ${text}<br>`;
        })

        // **bold**
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

        // *italic*
        .replace(/\*(.+?)\*/g, "<em>$1</em>")

        // [text](url)
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

        // Line breaks
        .replace(/\n{3,}/g, "<br><br><br>")
        .replace(/\n{2}/g, "<br><br>")
        .replace(/\n/g, "<br>")

        // Cleanup
        .replace(/(<br>\s*){4,}/g, "<br><br><br>")
        .replace(/(<\/span>)(\s*<br>\s*)+(?=<span class="list-item">)/g, "$1")
        .replace(/(<span class="list-item">[\s\S]*?<\/span>)(\s*<br>\s*){2,}/g, "$1<br>")

        // Remove stray <br> tags directly adjacent to embed blocks for cleaner spacing
        .replace(/(<br>\s*)+(<span class="embed-block")/g, "$2")
        .replace(/(<\/span>)(\s*<br>\s*)+(?=<span class="embed-block")/g, "$1")

        .trim();

      return processed;
    };

    const processed = processContentAsSingleParagraph(content);
    return DOMPurify.sanitize(processed, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "a", "span", "ol", "ul", "li",
        "img", "iframe", "video", "source", "blockquote",
      ],
      ALLOWED_ATTR: [
        "href", "target", "rel", "class",
        "src", "alt", "loading", "title",
        "allow", "allowfullscreen", "allowtransparency", "scrolling",
        "controls", "preload", "playsinline", "poster",
      ],
      ADD_ATTR: ["allowfullscreen"],
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
            [&_.list-item]:block [&_.list-item]:mt-1 [&_.list-item]:mb-0 [&_.list-item]:pl-6 [&_.list-item]:-indent-4
            [&_img]:block [&_img]:my-6 [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:mx-auto
            [&_.embed-block]:block [&_.embed-block]:my-6 [&_.embed-block]:relative [&_.embed-block]:w-full [&_.embed-block]:overflow-hidden [&_.embed-block]:rounded-lg [&_.embed-block]:bg-black [&_.embed-block]:aspect-video
            [&_.embed-portrait]:aspect-[9/16] [&_.embed-portrait]:max-w-md [&_.embed-portrait]:mx-auto
            [&_.embed-block_iframe]:absolute [&_.embed-block_iframe]:inset-0 [&_.embed-block_iframe]:w-full [&_.embed-block_iframe]:h-full [&_.embed-block_iframe]:border-0
            [&_.embed-block_video]:absolute [&_.embed-block_video]:inset-0 [&_.embed-block_video]:w-full [&_.embed-block_video]:h-full
            [&_.embed-block_blockquote]:relative [&_.embed-block_blockquote]:bg-white [&_.embed-block_blockquote]:text-black [&_.embed-block_blockquote]:p-4 [&_.embed-block_blockquote]:rounded-lg"
            dangerouslySetInnerHTML={{ __html: processedContent }}
          />
        </div>
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default BlogArticleContent;
