import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import StickyPlayerBar from "@/components/player/StickyPlayerBar";

export interface PlayerTrack {
  trackId: string;
  title: string;
  artist: string;
  videoId: string;
  coverUrl?: string | null;
}

interface MusicPlayerContextValue {
  queue: PlayerTrack[];
  index: number;
  current: PlayerTrack | null;
  isPlaying: boolean;
  playQueue: (tracks: PlayerTrack[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  prev: () => void;
  close: () => void;
}

const MusicPlayerContext = createContext<MusicPlayerContextValue | null>(null);

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytApiPromise: Promise<any> | null = null;
const loadYouTubeApi = () => {
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    if (window.YT?.Player) return resolve(window.YT);
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prevReady?.();
      resolve(window.YT);
    };
    const s = document.createElement("script");
    s.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(s);
  });
  return ytApiPromise;
};

export const MusicPlayerProvider = ({ children }: { children: ReactNode }) => {
  const [queue, setQueue] = useState<PlayerTrack[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playerRef = useRef<any>(null);
  const hostRef = useRef<HTMLDivElement>(null);
  const queueRef = useRef(queue);
  const indexRef = useRef(index);
  queueRef.current = queue;
  indexRef.current = index;

  const current = queue[index] ?? null;

  const next = useCallback(() => {
    if (indexRef.current < queueRef.current.length - 1) setIndex((i) => i + 1);
    else setIsPlaying(false);
  }, []);

  const prev = useCallback(() => {
    setIndex((i) => Math.max(0, i - 1));
  }, []);

  // Create or update the YouTube player whenever the current video changes
  useEffect(() => {
    if (!current || !hostRef.current) return;
    let cancelled = false;
    loadYouTubeApi().then((YT) => {
      if (cancelled) return;
      if (playerRef.current) {
        playerRef.current.loadVideoById(current.videoId);
        return;
      }
      const el = document.createElement("div");
      hostRef.current!.appendChild(el);
      playerRef.current = new YT.Player(el, {
        width: "100%",
        height: "100%",
        videoId: current.videoId,
        playerVars: { autoplay: 1, playsinline: 1, modestbranding: 1, rel: 0 },
        events: {
          onStateChange: (e: any) => {
            if (e.data === YT.PlayerState.PLAYING) setIsPlaying(true);
            if (e.data === YT.PlayerState.PAUSED) setIsPlaying(false);
            if (e.data === YT.PlayerState.ENDED) next();
          },
          onError: () => next(),
        },
      });
    });
    return () => {
      cancelled = true;
    };
  }, [current?.videoId, next]);

  const playQueue = useCallback((tracks: PlayerTrack[], startIndex = 0) => {
    if (!tracks.length) return;
    setQueue(tracks);
    setIndex(startIndex);
    setIsPlaying(true);
    // Same video re-selected: restart it
    const p = playerRef.current;
    if (p && tracks[startIndex]?.videoId === queueRef.current[indexRef.current]?.videoId) {
      p.seekTo?.(0);
      p.playVideo?.();
    }
  }, []);

  const togglePlay = useCallback(() => {
    const p = playerRef.current;
    if (!p) return;
    if (isPlaying) p.pauseVideo();
    else p.playVideo();
  }, [isPlaying]);

  const close = useCallback(() => {
    playerRef.current?.destroy?.();
    playerRef.current = null;
    if (hostRef.current) hostRef.current.innerHTML = "";
    setQueue([]);
    setIndex(0);
    setIsPlaying(false);
  }, []);

  return (
    <MusicPlayerContext.Provider value={{ queue, index, current, isPlaying, playQueue, togglePlay, next, prev, close }}>
      {children}
      <StickyPlayerBar videoHostRef={hostRef} />
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error("useMusicPlayer must be used inside MusicPlayerProvider");
  return ctx;
};
