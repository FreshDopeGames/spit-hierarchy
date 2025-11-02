import { 
  Target, 
  BookOpen, 
  Wrench, 
  Sparkles, 
  Mic2, 
  Waves, 
  PenLine, 
  Globe, 
  Lightbulb, 
  Headphones,
  LucideIcon
} from "lucide-react";

export const getCategoryIcon = (categoryName: string): LucideIcon | null => {
  const iconMap: Record<string, LucideIcon> = {
    "Consistency": Target,
    "Storytelling": BookOpen,
    "Technical Skill": Wrench,
    "Cultural Impact": Sparkles,
    "Performance": Mic2,
    "Flow On Beats": Waves,
    "Lyrical Ability": PenLine,
    "Metaphor": Globe,
    "Freestyling": Lightbulb,
    "Beat Selection": Headphones,
  };

  return iconMap[categoryName] || null;
};
