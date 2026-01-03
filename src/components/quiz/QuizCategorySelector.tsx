import React from 'react';
import { cn } from '@/lib/utils';
import { User, Disc, MapPin, Calendar, Layers, Cake, UserCheck, Library, AtSign } from 'lucide-react';
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
  { value: 'birth_year', label: 'Birth Year', icon: Cake, description: 'When were they born?' },
  { value: 'real_name', label: 'Real Name', icon: UserCheck, description: 'Behind the stage name' },
  { value: 'origins', label: 'Origins', icon: MapPin, description: 'Where they\'re from' },
  { value: 'career', label: 'Career', icon: Calendar, description: 'Timeline & history' },
  { value: 'discography', label: 'Discography', icon: Library, description: 'Albums & releases' },
  { value: 'aliases', label: 'Aliases', icon: AtSign, description: 'AKA & nicknames' },
  { value: 'albums', label: 'Albums', icon: Disc, description: 'Album trivia' },
  { value: 'rapper_facts', label: 'Rapper Facts', icon: User, description: 'General knowledge' },
];

const QuizCategorySelector: React.FC<QuizCategorySelectorProps> = ({
  selectedCategory,
  onCategoryChange,
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
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
