// Shared embed helpers for blog content (used by editor preview and renderer).

export const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export const youTubeId = (url: string): string | null => {
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

export type EmbedKind = "youtube" | "video" | "instagram" | "tiktok" | "twitter" | "image";

export const buildEmbed = (kind: string, rawUrl: string): string => {
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
    const cleaned = url.replace(/\?.*$/, "").replace(/#.*$/, "").replace(/\/$/, "");
    return `<span class="embed-block embed-portrait"><iframe src="${escapeAttr(cleaned + "/embed")}" title="Instagram post" allowtransparency="true" allowfullscreen loading="lazy" scrolling="no"></iframe></span>`;
  }

  if (kind === "tiktok") {
    const m = url.match(/\/video\/(\d+)/);
    if (!m) return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
    return `<span class="embed-block embed-portrait"><iframe src="https://www.tiktok.com/embed/v2/${m[1]}" title="TikTok video" allow="autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen loading="lazy"></iframe></span>`;
  }

  if (kind === "twitter") {
    return `<span class="embed-block"><blockquote class="twitter-tweet"><a href="${safe}">${safe}</a></blockquote></span>`;
  }

  if (kind === "image") {
    return `<img src="${safe}" alt="" loading="lazy" />`;
  }

  return `<a href="${safe}" target="_blank" rel="noopener noreferrer">${safe}</a>`;
};

export interface DetectedEmbed {
  kind: EmbedKind;
  url: string;
  index: number; // position in source
}

// Auto-detect embed kind from a bare URL (used for raw-pasted links).
export const detectKindFromUrl = (url: string): EmbedKind | null => {
  const u = url.toLowerCase();
  if (/youtube\.com\/(watch|embed|shorts)|youtu\.be\//.test(u)) return "youtube";
  if (/instagram\.com\/(p|reel|tv)\//.test(u)) return "instagram";
  if (/tiktok\.com\/.+\/video\/\d+/.test(u)) return "tiktok";
  if (/(twitter\.com|x\.com)\/[^/]+\/status\/\d+/.test(u)) return "twitter";
  if (/\.(mp4|webm|ogg)(\?|$)/.test(u)) return "video";
  if (/\.(png|jpe?g|gif|webp|avif|svg)(\?|$)/.test(u)) return "image";
  return null;
};

// Detect all images, @[kind](url) embeds, and bare URLs to known platforms.
export const detectEmbeds = (content: string): DetectedEmbed[] => {
  const results: DetectedEmbed[] = [];
  const embedRe = /@\[(youtube|video|instagram|tiktok|twitter)\]\(([^)]+)\)/gi;
  const imageRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  // Bare URLs not already inside a markdown image or @[..](..) token.
  const urlRe = /(?<![\(\[])\bhttps?:\/\/[^\s<>"')]+/gi;

  const claimedRanges: Array<[number, number]> = [];

  let m: RegExpExecArray | null;
  while ((m = embedRe.exec(content)) !== null) {
    results.push({
      kind: m[1].toLowerCase() as EmbedKind,
      url: m[2].trim(),
      index: m.index,
    });
    claimedRanges.push([m.index, m.index + m[0].length]);
  }
  while ((m = imageRe.exec(content)) !== null) {
    results.push({ kind: "image", url: m[1].trim(), index: m.index });
    claimedRanges.push([m.index, m.index + m[0].length]);
  }
  while ((m = urlRe.exec(content)) !== null) {
    const idx = m.index;
    const inClaimed = claimedRanges.some(([s, e]) => idx >= s && idx < e);
    if (inClaimed) continue;
    const kind = detectKindFromUrl(m[0]);
    if (!kind) continue;
    results.push({ kind, url: m[0].trim(), index: idx });
  }
  return results.sort((a, b) => a.index - b.index);
};
