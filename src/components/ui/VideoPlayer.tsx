import { useState } from "react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

interface VideoPlayerProps {
  videoUrl?: string;
  fallbackImageUrl?: string;
  alt: string;
  className?: string;
}

const VideoPlayer = ({ videoUrl, fallbackImageUrl, alt, className }: VideoPlayerProps) => {
  const [hasVideoError, setHasVideoError] = useState(false);

  if (!videoUrl || hasVideoError) {
    return fallbackImageUrl ? (
      <ResponsiveImage
        src={fallbackImageUrl}
        alt={alt}
        className={className}
        context="hero"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
      />
    ) : null;
  }

  return (
    <video
      className={className}
      controls
      preload="metadata"
      onError={() => setHasVideoError(true)}
      poster={fallbackImageUrl}
    >
      <source src={videoUrl} type="video/mp4" />
      <source src={videoUrl} type="video/webm" />
      <source src={videoUrl} type="video/ogg" />
      Your browser does not support the video tag.
      {fallbackImageUrl && (
        <ResponsiveImage
          src={fallbackImageUrl}
          alt={alt}
          className={className}
          context="hero"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px"
        />
      )}
    </video>
  );
};

export default VideoPlayer;