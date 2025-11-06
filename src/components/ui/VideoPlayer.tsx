import { useState } from "react";
import ResponsiveImage from "@/components/ui/ResponsiveImage";

interface VideoPlayerProps {
  videoUrl?: string;
  fallbackImageUrl?: string;
  alt: string;
  className?: string;
}

const getYouTubeVideoId = (url: string): string | null => {
  if (!url) return null;
  
  // Handle youtu.be format
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  
  // Handle youtube.com/watch format
  const longMatch = url.match(/youtube\.com\/watch\?v=([^&]+)/);
  if (longMatch) return longMatch[1];
  
  // Handle youtube.com/embed format
  const embedMatch = url.match(/youtube\.com\/embed\/([^?]+)/);
  if (embedMatch) return embedMatch[1];
  
  return null;
};

const VideoPlayer = ({ videoUrl, fallbackImageUrl, alt, className }: VideoPlayerProps) => {
  const [hasVideoError, setHasVideoError] = useState(false);
  const youtubeVideoId = videoUrl ? getYouTubeVideoId(videoUrl) : null;

  // Render YouTube iframe if it's a YouTube URL
  if (youtubeVideoId) {
    return (
      <div className={`relative ${className}`} style={{ aspectRatio: '16/9' }}>
        <iframe
          className="absolute inset-0 w-full h-full rounded-xl"
          src={`https://www.youtube.com/embed/${youtubeVideoId}`}
          title={alt}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

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