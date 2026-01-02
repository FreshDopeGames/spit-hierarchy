import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Target, Flame, RotateCcw, Home, Award } from 'lucide-react';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from '@/components/ui/themed-card';
import { useQuizBadges } from '@/hooks/useQuizBadges';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface QuizResultsProps {
  sessionScore: number;
  sessionCorrect: number;
  totalQuestions: number;
  sessionStreak: number;
  newBadges: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  onPlayAgain: () => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  sessionScore,
  sessionCorrect,
  totalQuestions,
  sessionStreak,
  newBadges,
  onPlayAgain,
}) => {
  const accuracy = Math.round((sessionCorrect / totalQuestions) * 100);
  const { getNextBadgesToEarn, getRarityColor } = useQuizBadges();
  const nextBadges = getNextBadgesToEarn(3);

  const getPerformanceMessage = () => {
    if (accuracy === 100) return { text: "Perfect Score! 🏆", color: "text-yellow-400" };
    if (accuracy >= 80) return { text: "Excellent! 🔥", color: "text-green-400" };
    if (accuracy >= 60) return { text: "Good Job! 👍", color: "text-blue-400" };
    if (accuracy >= 40) return { text: "Keep Practicing! 💪", color: "text-yellow-400" };
    return { text: "Room to Improve 📚", color: "text-red-400" };
  };

  const performance = getPerformanceMessage();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Main Results Card */}
      <ThemedCard variant="dark" className="border-2 border-[hsl(var(--theme-primary))]/30">
        <ThemedCardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.2 }}
          >
            <Trophy className="w-16 h-16 mx-auto text-[hsl(var(--theme-primary))] mb-4" />
          </motion.div>
          <ThemedCardTitle className="text-2xl">Quiz Complete!</ThemedCardTitle>
          <p className={cn("text-xl font-[var(--theme-font-heading)] mt-2", performance.color)}>
            {performance.text}
          </p>
        </ThemedCardHeader>
        
        <ThemedCardContent className="space-y-6">
          {/* Score Display */}
          <div className="text-center">
            <p className="text-5xl font-[var(--theme-font-heading)] text-[hsl(var(--theme-primary))]">
              {sessionScore}
            </p>
            <p className="text-muted-foreground">Total Points</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-black/30 rounded-xl border border-border">
              <Target className="w-6 h-6 mx-auto mb-2 text-blue-400" />
              <p className="text-2xl font-[var(--theme-font-heading)] text-foreground">
                {sessionCorrect}/{totalQuestions}
              </p>
              <p className="text-xs text-muted-foreground">Correct</p>
            </div>
            
            <div className="text-center p-4 bg-black/30 rounded-xl border border-border">
              <div className={cn(
                "w-6 h-6 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-bold",
                accuracy >= 70 ? "bg-green-500/20 text-green-400" : 
                accuracy >= 40 ? "bg-yellow-500/20 text-yellow-400" : 
                "bg-red-500/20 text-red-400"
              )}>
                %
              </div>
              <p className="text-2xl font-[var(--theme-font-heading)] text-foreground">
                {accuracy}%
              </p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            
            <div className="text-center p-4 bg-black/30 rounded-xl border border-border">
              <Flame className={cn(
                "w-6 h-6 mx-auto mb-2",
                sessionStreak >= 5 ? "text-orange-400" : "text-muted-foreground"
              )} />
              <p className="text-2xl font-[var(--theme-font-heading)] text-foreground">
                {sessionStreak}
              </p>
              <p className="text-xs text-muted-foreground">Best Streak</p>
            </div>
          </div>
        </ThemedCardContent>
      </ThemedCard>

      {/* New Badges Earned */}
      {newBadges.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <ThemedCard variant="gradient" className="border-2 border-yellow-500/30">
            <ThemedCardHeader>
              <ThemedCardTitle className="flex items-center gap-2">
                <Award className="w-5 h-5 text-yellow-400" />
                Badges Unlocked!
              </ThemedCardTitle>
            </ThemedCardHeader>
            <ThemedCardContent>
              <div className="flex flex-wrap gap-3">
                {newBadges.map((badge, index) => (
                  <motion.div
                    key={badge.id}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.4 + index * 0.1, type: "spring" }}
                    className={cn(
                      "px-4 py-2 rounded-full border-2",
                      getRarityColor(badge.rarity)
                    )}
                  >
                    <span className="font-[var(--theme-font-heading)]">{badge.name}</span>
                  </motion.div>
                ))}
              </div>
            </ThemedCardContent>
          </ThemedCard>
        </motion.div>
      )}

      {/* Next Badges to Earn */}
      {nextBadges.length > 0 && (
        <ThemedCard className="border border-border">
          <ThemedCardHeader className="pb-2">
            <ThemedCardTitle className="text-sm text-muted-foreground">
              Next Badges to Earn
            </ThemedCardTitle>
          </ThemedCardHeader>
          <ThemedCardContent>
            <div className="space-y-3">
              {nextBadges.map(({ badge, currentProgress, percentage }) => (
                <div key={badge.id} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{badge.name}</span>
                    <span className="text-muted-foreground">
                      {currentProgress}/{badge.threshold_correct}
                    </span>
                  </div>
                  <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-border">
                    <div
                      className="h-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </ThemedCardContent>
        </ThemedCard>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <ThemedButton
          onClick={onPlayAgain}
          variant="gradient"
          className="flex-1"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Play Again
        </ThemedButton>
        <ThemedButton
          asChild
          variant="outline"
          className="flex-1"
        >
          <Link to="/profile">
            <Home className="w-4 h-4 mr-2" />
            View Profile
          </Link>
        </ThemedButton>
      </div>
    </motion.div>
  );
};

export default QuizResults;
