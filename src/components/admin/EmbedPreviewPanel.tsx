import { useMemo } from "react";
import DOMPurify from "dompurify";
import { Eye } from "lucide-react";
import { detectEmbeds, buildEmbed } from "@/utils/blogEmbeds";

interface EmbedPreviewPanelProps {
  content: string;
}

const KIND_LABEL: Record<string, string> = {
  youtube: "YouTube",
  video: "Video (MP4/WebM)",
  instagram: "Instagram",
  tiktok: "TikTok",
  twitter: "X / Twitter",
  image: "Image",
};

const EmbedPreviewPanel = ({ content }: EmbedPreviewPanelProps) => {
  const embeds = useMemo(() => detectEmbeds(content || ""), [content]);

  const sanitizedItems = useMemo(
    () =>
      embeds.map((e) => ({
        ...e,
        html: DOMPurify.sanitize(buildEmbed(e.kind, e.url), {
          ALLOWED_TAGS: ["span", "iframe", "video", "source", "img", "a", "blockquote"],
          ALLOWED_ATTR: [
            "href", "target", "rel", "class",
            "src", "alt", "loading", "title",
            "allow", "allowfullscreen", "allowtransparency", "scrolling",
            "controls", "preload", "playsinline", "poster",
          ],
          ADD_ATTR: ["allowfullscreen"],
        }),
      })),
    [embeds]
  );

  return (
    <div className="border border-gray-300 rounded-md bg-white p-3">
      <div className="flex items-center gap-2 mb-2 text-gray-900">
        <Eye className="w-4 h-4" />
        <h4 className="text-sm font-semibold">Embed preview</h4>
        <span className="text-xs text-gray-500">
          ({sanitizedItems.length} {sanitizedItems.length === 1 ? "embed" : "embeds"} detected)
        </span>
      </div>

      {sanitizedItems.length === 0 ? (
        <p className="text-xs text-gray-500 italic">
          Insert an image or embed to see a live preview here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sanitizedItems.map((item, idx) => (
            <div key={`${item.index}-${idx}`} className="border border-gray-200 rounded-md overflow-hidden bg-gray-50">
              <div className="flex items-center justify-between px-2 py-1 bg-gray-100 text-xs text-gray-700">
                <span className="font-semibold">{KIND_LABEL[item.kind] || item.kind}</span>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate ml-2 max-w-[60%] text-blue-600 hover:underline"
                  title={item.url}
                >
                  {item.url}
                </a>
              </div>
              <div
                className="p-2
                  [&_.embed-block]:block [&_.embed-block]:relative [&_.embed-block]:w-full [&_.embed-block]:overflow-hidden [&_.embed-block]:rounded [&_.embed-block]:bg-black [&_.embed-block]:aspect-video
                  [&_.embed-portrait]:aspect-[9/16] [&_.embed-portrait]:max-w-[240px] [&_.embed-portrait]:mx-auto
                  [&_.embed-block_iframe]:absolute [&_.embed-block_iframe]:inset-0 [&_.embed-block_iframe]:w-full [&_.embed-block_iframe]:h-full [&_.embed-block_iframe]:border-0
                  [&_.embed-block_video]:absolute [&_.embed-block_video]:inset-0 [&_.embed-block_video]:w-full [&_.embed-block_video]:h-full
                  [&_.embed-block_blockquote]:relative [&_.embed-block_blockquote]:bg-white [&_.embed-block_blockquote]:text-black [&_.embed-block_blockquote]:p-2 [&_.embed-block_blockquote]:rounded [&_.embed-block_blockquote]:text-xs
                  [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded [&_img]:mx-auto [&_img]:block"
                dangerouslySetInnerHTML={{ __html: item.html }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmbedPreviewPanel;
