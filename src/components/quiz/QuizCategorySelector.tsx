import React from 'react';
import { cn } from '@/lib/utils';
import { Brain, User, Disc, MapPin, Calendar, Layers } from 'lucide-react';
import type { QuizCategory } from '@/hooks/useQuiz';

interface QuizCategorySelectorProps {
  selectedCategory: QuizCategory;
  onCategoryChange: (category: QuizCategory) => void;
}

const categories: Array<{
  value: QuizCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}> = [
  { value: 'all', label: 'All Categories', icon: Layers, description: 'Mix of everything' },
  { value: 'rapper_facts', label: 'Rapper Facts', icon: User, description: 'Names, aliases & more' },
  { value: 'albums', label: 'Albums', icon: Disc, description: 'Discography knowledge' },
  { value: 'origins', label: 'Origins', icon: MapPin, description: 'Where they\'re from' },
  { value: 'career', label: 'Career', icon: Calendar, description: 'Timeline & history' },
];

const QuizCategorySelector: React.FC<QuizCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
      {categories.map(({ value, label, icon: Icon, description }) => (
        <button
          key={value}
          onClick={() => onCategoryChange(value)}
          className={cn(
            "flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200",
            "hover:border-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/5",
            selectedCategory === value
              ? "border-[hsl(var(--theme-primary))] bg-[hsl(var(--theme-primary))]/10"
              : "border-border bg-black/30"
          )}
        >
          <Icon className={cn(
            "w-6 h-6 mb-2",
            selectedCategory === value 
              ? "text-[hsl(var(--theme-primary))]" 
              : "text-muted-foreground"
          )} />
          <span className={cn(
            "text-sm font-[var(--theme-font-heading)] text-center",
            selectedCategory === value 
              ? "text-[hsl(var(--theme-primary))]" 
              : "text-foreground"
          )}>
            {label}
          </span>
          <span className="text-xs text-muted-foreground text-center mt-1 hidden sm:block">
            {description}
          </span>
        </button>
      ))}
    </div>
  );
};

export default QuizCategorySelector;
