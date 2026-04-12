
import React from "react";
import { Link } from "react-router-dom";
import { Music, Pencil, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface TopFiveSlotProps {
  position: number;
  rapper: {
    id: string;
    name: string;
    image_url: string | null;
    slug?: string | null;
  } | null;
  onEditClick: () => void;
}

const TopFiveSlot = ({ position, rapper, onEditClick }: TopFiveSlotProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: position,
    disabled: !rapper,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onEditClick();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="border-2 border-[hsl(var(--theme-primary))]/20 rounded-lg p-3 relative bg-[hsl(var(--theme-surfaceSecondary))]"
    >
      {/* Position number in top left */}
      <div 
        className="absolute top-2 sm:top-3 left-2 sm:left-3 text-sm sm:text-lg font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center border z-10"
        style={{
          color: 'hsl(var(--theme-primary))',
          backgroundColor: 'hsl(var(--theme-surface))',
          borderColor: 'hsl(var(--theme-primary))',
          fontFamily: 'var(--theme-font-heading)'
        }}
      >
        #{position}
      </div>

      {/* Drag handle - top right, only on filled slots */}
      {rapper && (
        <button
          {...attributes}
          {...listeners}
          className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10 cursor-grab active:cursor-grabbing p-1 rounded text-[hsl(var(--theme-textMuted))] hover:text-[hsl(var(--theme-primary))] transition-colors touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="w-5 h-5" />
        </button>
      )}
      
      <div className="flex flex-col items-center space-y-4">
        {rapper ? (
          <>
            <Link 
              to={`/rapper/${rapper.slug || rapper.id}`}
              className="w-full max-w-60 h-32 sm:h-40 rounded-lg overflow-hidden border border-[hsl(var(--theme-primary))]/20 bg-[hsl(var(--theme-surface))] block hover:opacity-90 transition-opacity"
            >
              {rapper.image_url ? (
                <img 
                  src={rapper.image_url} 
                  alt={rapper.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Music className="w-12 h-12" style={{ color: 'hsl(var(--theme-textMuted))' }} />
                </div>
              )}
            </Link>
            <div 
              className="text-sm sm:text-lg font-bold text-center line-clamp-2"
              style={{ 
                color: 'hsl(var(--theme-text))',
                fontFamily: 'var(--theme-font-body)'
              }}
            >
              {rapper.name}
            </div>
            {/* Edit button */}
            <Button
              onClick={handleEditClick}
              size="icon"
              variant="outline"
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full border-[hsl(var(--theme-primary))]/50 bg-[hsl(var(--theme-surface))] hover:bg-[hsl(var(--theme-primary))] hover:text-black text-[hsl(var(--theme-primary))]"
            >
              <Pencil className="w-4 h-4" />
            </Button>
          </>
        ) : (
          <div 
            onClick={onEditClick}
            className="cursor-pointer group w-full"
          >
            <div 
              className="w-full max-w-60 h-32 sm:h-40 rounded-lg border-2 border-dashed border-[hsl(var(--theme-primary))]/30 flex items-center justify-center group-hover:opacity-80 bg-[hsl(var(--theme-surface))] mx-auto"
            >
              <Music className="w-12 h-12" style={{ color: 'hsl(var(--theme-textMuted))' }} />
            </div>
            <div 
              className="text-sm sm:text-lg font-bold text-center mt-4"
              style={{ 
                color: 'hsl(var(--theme-textMuted))',
                fontFamily: 'var(--theme-font-body)'
              }}
            >
              Click to add rapper
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TopFiveSlot;
