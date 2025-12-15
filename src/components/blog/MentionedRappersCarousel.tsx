import { useMentionedRappers } from "@/hooks/useMentionedRappers";
import RapperAvatar from "@/components/RapperAvatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Mic2 } from "lucide-react";

interface MentionedRappersCarouselProps {
  content: string;
}

const MentionedRappersCarousel = ({ content }: MentionedRappersCarouselProps) => {
  const { data: rappers, isLoading } = useMentionedRappers(content);

  // Don't render if no rappers mentioned or still loading
  if (isLoading || !rappers || rappers.length === 0) {
    return null;
  }

  return (
    <div className="bg-[hsl(var(--theme-surface))] rounded-xl p-6 border border-border">
      <div className="flex items-center gap-2 mb-4">
        <Mic2 className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
        <h3 className="font-[family-name:var(--heading-font)] text-lg text-foreground">
          Rappers Mentioned
        </h3>
        <span className="text-sm text-muted-foreground">
          ({rappers.length})
        </span>
      </div>

      <Carousel
        opts={{
          align: "start",
          loop: false,
          dragFree: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {rappers.map((rapper) => (
            <CarouselItem
              key={rapper.id}
              className="pl-2 md:pl-4 basis-auto"
            >
              <div className="flex flex-col items-center gap-2">
                <RapperAvatar
                  rapper={rapper}
                  size="sm"
                  variant="circular"
                />
                <span className="text-xs text-center text-muted-foreground max-w-[100px] line-clamp-2">
                  {rapper.name}
                </span>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {rappers.length > 4 && (
          <>
            <CarouselPrevious className="hidden md:flex -left-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
            <CarouselNext className="hidden md:flex -right-4 bg-background/80 backdrop-blur-sm border-border hover:bg-background" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default MentionedRappersCarousel;
