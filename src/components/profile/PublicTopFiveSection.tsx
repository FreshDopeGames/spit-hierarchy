import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import RapperAvatar from "@/components/RapperAvatar";
import { Music } from "lucide-react";

interface PublicTopFiveSectionProps {
  userId: string;
  username: string;
}

interface TopRapperData {
  position: number;
  rapper_id: string;
  rappers: {
    id: string;
    name: string;
    slug: string;
    image_url: string | null;
  } | null;
}

const PublicTopFiveSection = ({ userId, username }: PublicTopFiveSectionProps) => {
  const { data: topRappers, isLoading } = useQuery({
    queryKey: ["public-top-rappers", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_top_rappers")
        .select(`
          position,
          rapper_id,
          rappers (
            id,
            name,
            slug,
            image_url
          )
        `)
        .eq("user_id", userId)
        .order("position");
      
      if (error) throw error;
      return (data || []) as TopRapperData[];
    },
    enabled: !!userId
  });

  if (isLoading) {
    return (
      <div className="bg-black border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="animate-pulse">
          <div className="h-6 rounded mb-4 w-32 mx-auto bg-[var(--theme-surface)]"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-48 rounded bg-[var(--theme-surface)]"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!topRappers || topRappers.length === 0) {
    return null;
  }

  const slots = Array.from({ length: 5 }, (_, index) => {
    const position = index + 1;
    const existingRapper = topRappers.find(item => item.position === position);
    return {
      position,
      rapper: existingRapper?.rappers || null
    };
  });

  const RapperSlot = ({ position, rapper }: { position: number; rapper: any }) => (
    <div className="relative bg-[var(--theme-surface)] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-4 hover:border-[hsl(var(--theme-primary))] transition-all">
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-primaryDark))] rounded-full flex items-center justify-center text-black font-bold text-sm z-10">
        #{position}
      </div>
      
      {rapper ? (
        <div className="flex flex-col items-center gap-3">
          <RapperAvatar 
            rapper={{ id: rapper.id, name: rapper.name, slug: rapper.slug }}
            size="lg"
            variant="square"
            imageUrl={rapper.image_url}
          />
          <span className="text-sm font-bold text-[var(--theme-text)] text-center line-clamp-2 font-[var(--theme-font-body)]">
            {rapper.name}
          </span>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 opacity-30">
          <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-lg bg-[var(--theme-background)] border-2 border-dashed border-[var(--theme-textMuted)] flex items-center justify-center">
            <Music className="w-12 h-12 text-[var(--theme-textMuted)]" />
          </div>
          <span className="text-sm text-[var(--theme-textMuted)] font-[var(--theme-font-body)]">
            Empty Slot
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="bg-black border-[hsl(var(--theme-primary))] border-4 shadow-lg shadow-[var(--theme-primary)]/20 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
      <h3 className="text-lg sm:text-xl font-bold text-[hsl(var(--theme-primary))] font-mogra text-center mb-4">
        {username}'s Top 5
      </h3>
      
      {/* Desktop Layout: 2 top, 3 bottom */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {slots.slice(0, 2).map(slot => (
            <RapperSlot key={slot.position} position={slot.position} rapper={slot.rapper} />
          ))}
        </div>
        <div className="grid grid-cols-3 gap-4">
          {slots.slice(2, 5).map(slot => (
            <RapperSlot key={slot.position} position={slot.position} rapper={slot.rapper} />
          ))}
        </div>
      </div>

      {/* Tablet Layout: 1 full width, then 2x2 */}
      <div className="hidden sm:block lg:hidden">
        <div className="grid grid-cols-1 gap-4 mb-4">
          <RapperSlot position={slots[0].position} rapper={slots[0].rapper} />
        </div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          {slots.slice(1, 3).map(slot => (
            <RapperSlot key={slot.position} position={slot.position} rapper={slot.rapper} />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4">
          {slots.slice(3, 5).map(slot => (
            <RapperSlot key={slot.position} position={slot.position} rapper={slot.rapper} />
          ))}
        </div>
      </div>

      {/* Mobile Layout: Single column */}
      <div className="block sm:hidden">
        <div className="grid grid-cols-1 gap-4">
          {slots.map(slot => (
            <RapperSlot key={slot.position} position={slot.position} rapper={slot.rapper} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicTopFiveSection;
