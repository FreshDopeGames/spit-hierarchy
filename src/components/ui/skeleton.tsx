
import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

// Avatar skeleton component for circular loading states
function AvatarSkeleton({
  size = 'sm',
  className = ''
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs': return 'w-6 h-6';
      case 'sm': return 'w-8 h-8';
      case 'md': return 'w-10 h-10';
      case 'lg': return 'w-12 h-12';
      default: return 'w-8 h-8';
    }
  };

  return (
    <div
      className={`${getSizeClasses()} bg-rap-gold/20 rounded-full animate-pulse flex-shrink-0 ${className}`}
    />
  );
}

// Text skeleton component for horizontal loading states
function TextSkeleton({
  width = 'w-20',
  height = 'h-4',
  className = ''
}: {
  width?: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`${width} ${height} bg-rap-gold/20 rounded animate-pulse ${className}`}
    />
  );
}

export { Skeleton, AvatarSkeleton, TextSkeleton }
