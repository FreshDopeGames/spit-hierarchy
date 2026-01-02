import React from 'react';
import { motion } from 'framer-motion';
import { Award, Lock, Brain, User, Disc, MapPin, Calendar, Flame, Trophy, Crown, GraduationCap, Lightbulb, Users, UserCheck, Map, Clock, Zap, Sparkles, Library, Globe, History } from 'lucide-react';
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from '@/components/ui/themed-card';
import { useQuizBadges, BadgeProgress } from '@/hooks/useQuizBadges';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface QuizBadgeDisplayProps {
  userId?: string;
  showProgress?: boolean;
  maxBadges?: number;
  title?: string;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Brain,
  User,
  Disc,
  MapPin,
  Calendar,
  Flame,
  Trophy,
  Crown,
  GraduationCap,
  Lightbulb,
  Users,
  UserCheck,
  Map,
  Clock,
  Zap,
  Sparkles,
  Library,
  Globe,
  History,
  Disc3: Disc,
  Award,
};

const QuizBadgeDisplay: React.FC<QuizBadgeDisplayProps> = ({
  userId,
  showProgress = false,
  maxBadges,
  title = "Quiz Badges",
}) => {
  const { earnedBadges, isLoading, getBadgeProgress, getRarityColor, getRarityGlow } = useQuizBadges(userId);

  if (isLoading) {
    return (
      <ThemedCard className="border border-border">
        <ThemedCardHeader>
          <Skeleton className="h-6 w-32" />
        </ThemedCardHeader>
        <ThemedCardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="aspect-square rounded-xl" />
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  const badgeProgress = getBadgeProgress();
  const displayBadges = showProgress 
    ? badgeProgress 
    : badgeProgress.filter(b => b.isEarned);
  
  const limitedBadges = maxBadges 
    ? displayBadges.slice(0, maxBadges) 
    : displayBadges;

  if (!showProgress && earnedBadges?.length === 0) {
    return (
      <ThemedCard className="border border-border">
        <ThemedCardHeader>
          <ThemedCardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
            {title}
          </ThemedCardTitle>
        </ThemedCardHeader>
        <ThemedCardContent>
          <p className="text-muted-foreground text-center py-4">
            No quiz badges earned yet. Take the quiz to unlock badges!
          </p>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard className="border border-border">
      <ThemedCardHeader>
        <ThemedCardTitle className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
          {title}
          {earnedBadges && (
            <span className="text-sm text-muted-foreground font-normal ml-2">
              ({earnedBadges.length} earned)
            </span>
          )}
        </ThemedCardTitle>
      </ThemedCardHeader>
      <ThemedCardContent>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
          {limitedBadges.map((badgeData, index) => {
            const { badge, isEarned, percentage, currentProgress } = badgeData;
            const IconComponent = iconMap[badge.icon] || Award;
            
            return (
              <motion.div
                key={badge.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "relative aspect-square rounded-xl border-2 flex flex-col items-center justify-center p-2 transition-all duration-200",
                  isEarned 
                    ? cn(getRarityColor(badge.rarity), getRarityGlow(badge.rarity))
                    : "border-border/50 bg-black/20 opacity-60"
                )}
              >
                {!isEarned && (
                  <Lock className="absolute top-1 right-1 w-3 h-3 text-muted-foreground" />
                )}
                
                <IconComponent className={cn(
                  "w-6 h-6 mb-1",
                  isEarned ? "" : "text-muted-foreground"
                )} />
                
                <span className={cn(
                  "text-[10px] text-center font-[var(--theme-font-heading)] leading-tight",
                  !isEarned && "text-muted-foreground"
                )}>
                  {badge.name}
                </span>
                
                {showProgress && !isEarned && (
                  <div className="absolute bottom-1 left-1 right-1">
                    <div className="h-1 bg-black/50 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[hsl(var(--theme-primary))]/50"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-[8px] text-muted-foreground">
                      {currentProgress}/{badge.threshold_correct}
                    </span>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        
        {maxBadges && displayBadges.length > maxBadges && (
          <p className="text-sm text-muted-foreground text-center mt-4">
            +{displayBadges.length - maxBadges} more badges
          </p>
        )}
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default QuizBadgeDisplay;
