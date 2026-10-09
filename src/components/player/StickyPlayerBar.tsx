import { RefObject, useContext } from "react";
import { Pause, Play, SkipBack, SkipForward, X } from "lucide-react";
import { useMusicPlayer } from "@/contexts/MusicPlayerContext";
import { cn } from "@/lib/utils";

interface StickyPlayerBarProps {
  videoHostRef: RefObject<HTMLDivElement>;
}

const ControlButton = ({ onClick, label, disabled, children, primary }: {
  onClick: () => void; label: string; disabled?: boolean; children: React.ReactNode; primary?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    disabled={disabled}
    className={cn(
      "inline-flex items-center justify-center rounded-full transition-opacity disabled:opacity-30",
      primary
        ? "h-10 w-10 bg-[hsl(var(--theme-primary))] text-black hover:opacity-85"
        : "h-8 w-8 text-[var(--theme-text)] hover:text-[hsl(var(--theme-primary))]",
    )}
  >
    {children}
  </button>
);

const StickyPlayerBar = ({ videoHostRef }: StickyPlayerBarProps) => {
  const { current, isPlaying, togglePlay, next, prev, close, index, queue } = useMusicPlayer();

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-50 border-t-4 border-[hsl(var(--theme-primary))] bg-black",
        !current && "pointer-events-none opacity-0 translate-y-full",
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      aria-hidden={!current}
    >
      <div className="mx-auto flex max-w-4xl items-center gap-3 px-3 py-2">
        <div ref={videoHostRef} className="h-14 w-24 shrink-0 overflow-hidden rounded bg-[var(--theme-surface)]" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-[var(--theme-text)]">{current?.title}</p>
          <p className="truncate text-xs text-[var(--theme-textMuted)]">
            {current?.artist} · via YouTube
          </p>
        </div>
        <div className="flex items-center gap-1">
          <ControlButton onClick={prev} label="Previous track" disabled={index === 0}>
            <SkipBack className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={togglePlay} label={isPlaying ? "Pause" : "Play"} primary>
            {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
          </ControlButton>
          <ControlButton onClick={next} label="Next track" disabled={index >= queue.length - 1}>
            <SkipForward className="h-4 w-4" />
          </ControlButton>
          <ControlButton onClick={close} label="Close player">
            <X className="h-4 w-4" />
          </ControlButton>
        </div>
      </div>
    </div>
  );
};

export default StickyPlayerBar;
