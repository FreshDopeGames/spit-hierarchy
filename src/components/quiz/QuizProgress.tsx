import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuizProgressProps {
  currentQuestion: number;
  totalQuestions: number;
  sessionScore: number;
  sessionCorrect: number;
  sessionStreak: number;
}

const QuizProgress: React.FC<QuizProgressProps> = ({
  currentQuestion,
  totalQuestions,
  sessionScore,
  sessionCorrect,
  sessionStreak,
}) => {
  const progress = ((currentQuestion) / totalQuestions) * 100;
  const accuracy = currentQuestion > 0 
    ? Math.round((sessionCorrect / currentQuestion) * 100) 
    : 0;

  return (
    <div className="space-y-4">
      {/* Progress Bar */}
      <div className="relative">
        <div className="h-2 bg-black/50 rounded-full overflow-hidden border border-border">
          <motion.div
            className="h-full bg-gradient-to-r from-[hsl(var(--theme-primary))] to-[hsl(var(--theme-accent))]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-muted-foreground">
          <span>Question {currentQuestion + 1} of {totalQuestions}</span>
          <span>{Math.round(progress)}% complete</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Score */}
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-border">
          <Trophy className="w-5 h-5 text-[hsl(var(--theme-primary))]" />
          <div>
            <p className="text-lg font-[var(--theme-font-heading)] text-foreground">
              {sessionScore}
            </p>
            <p className="text-xs text-muted-foreground">Points</p>
          </div>
        </div>

        {/* Accuracy */}
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-border">
          <Target className={cn(
            "w-5 h-5",
            accuracy >= 70 ? "text-green-400" : accuracy >= 40 ? "text-yellow-400" : "text-red-400"
          )} />
          <div>
            <p className="text-lg font-[var(--theme-font-heading)] text-foreground">
              {accuracy}%
            </p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 bg-black/30 rounded-lg p-3 border border-border">
          <Flame className={cn(
            "w-5 h-5",
            sessionStreak >= 5 ? "text-orange-400 animate-pulse" : "text-muted-foreground"
          )} />
          <div>
            <p className="text-lg font-[var(--theme-font-heading)] text-foreground">
              {sessionStreak}
            </p>
            <p className="text-xs text-muted-foreground">Streak</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizProgress;
