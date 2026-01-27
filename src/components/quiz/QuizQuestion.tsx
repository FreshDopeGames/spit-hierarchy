import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Clock } from 'lucide-react';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedBadge } from '@/components/ui/themed-badge';
import { cn } from '@/lib/utils';
import type { QuizQuestion as QuizQuestionType, QuizAnswer } from '@/hooks/useQuiz';

interface QuizQuestionProps {
  question: QuizQuestionType;
  shuffledAnswers: string[];
  onSubmit: (answer: string, timeTaken?: number) => Promise<QuizAnswer | null>;
  onNext: () => void;
  isSubmitting: boolean;
  questionNumber: number;
  totalQuestions: number;
}

const QuizQuestion: React.FC<QuizQuestionProps> = ({
  question,
  shuffledAnswers,
  onSubmit,
  onNext,
  isSubmitting,
  questionNumber,
  totalQuestions,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAnswer | null>(null);
  const [startTime] = useState(Date.now());
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Timer
  useEffect(() => {
    if (result) return;
    
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [startTime, result]);

  // Reset state when question changes
  useEffect(() => {
    setSelectedAnswer(null);
    setResult(null);
    setTimeElapsed(0);
  }, [question.id]);

  const handleAnswerSelect = async (answer: string) => {
    if (result || isSubmitting) return;
    
    setSelectedAnswer(answer);
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    const submitResult = await onSubmit(answer, timeTaken);
    setResult(submitResult);
  };

  const handleNext = () => {
    onNext();
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      rapper_facts: 'Rapper Facts',
      albums: 'Albums',
      origins: 'Origins',
      career: 'Career',
      discography: 'Discography',
      birth_year: 'Birth Year',
      real_name: 'Real Name',
    };
    return labels[category] || category;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'hard':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      default:
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    }
  };

  return (
    <motion.div
      key={question.id}
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ThemedBadge variant="outline" className="text-xs">
            {getCategoryLabel(question.category)}
          </ThemedBadge>
          <span className={cn(
            "text-xs px-2 py-0.5 rounded-full border",
            getDifficultyColor(question.difficulty)
          )}>
            {question.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{timeElapsed}s</span>
        </div>
      </div>

      {/* Question */}
      <div className="bg-black/40 border-2 border-[hsl(var(--theme-primary))]/30 rounded-xl p-6">
        <p className="text-lg font-[var(--theme-font-heading)] text-foreground leading-relaxed">
          {question.question_text}
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Question {questionNumber} of {totalQuestions} • {question.points} points
        </p>
      </div>

      {/* Answer Options */}
      <div className={cn(
        "grid gap-3",
        question.question_type === 'true_false' ? 'grid-cols-2' : 'grid-cols-1'
      )}>
        <AnimatePresence mode="wait">
          {shuffledAnswers.map((answer, index) => {
            const isSelected = selectedAnswer === answer;
            const isCorrect = result && answer === result.correct_answer;
            const isWrong = result && isSelected && !result.is_correct;
            
            return (
              <motion.button
                key={answer}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => handleAnswerSelect(answer)}
                disabled={!!result || isSubmitting}
                className={cn(
                  "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                  "font-[var(--theme-font-body)] text-base",
                  !result && !isSubmitting && "hover:border-[hsl(var(--theme-primary))] hover:bg-[hsl(var(--theme-primary))]/10 cursor-pointer",
                  !result && isSelected && "border-[hsl(var(--theme-primary))] bg-[hsl(var(--theme-primary))]/10",
                  !result && !isSelected && "border-border bg-black/30",
                  isCorrect && "border-green-500 bg-green-500/20",
                  isWrong && "border-red-500 bg-red-500/20",
                  result && !isCorrect && !isWrong && "border-border/50 bg-black/20 opacity-50",
                  (result || isSubmitting) && "cursor-not-allowed"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    isCorrect && "text-green-400",
                    isWrong && "text-red-400"
                  )}>
                    {answer}
                  </span>
                  {isCorrect && <Check className="w-5 h-5 text-green-400" />}
                  {isWrong && <X className="w-5 h-5 text-red-400" />}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Result & Next Button */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className={cn(
              "p-4 rounded-xl border-2 text-center",
              result.is_correct 
                ? "border-green-500/50 bg-green-500/10" 
                : "border-red-500/50 bg-red-500/10"
            )}>
              <p className={cn(
                "text-lg font-[var(--theme-font-heading)]",
                result.is_correct ? "text-green-400" : "text-red-400"
              )}>
                {result.is_correct ? '🎉 Correct!' : '❌ Incorrect'}
              </p>
              {result.is_correct && (
                <p className="text-sm text-muted-foreground mt-1">
                  +{result.points_earned} points
                </p>
              )}
              {!result.is_correct && (
                <p className="text-sm text-muted-foreground mt-1">
                  The correct answer was: <span className="text-foreground">{result.correct_answer}</span>
                </p>
              )}
            </div>
            
            <ThemedButton
              onClick={handleNext}
              className="w-full !bg-[hsl(var(--theme-primary))] !text-black hover:!bg-[hsl(var(--theme-primary))]/90"
            >
              {questionNumber < totalQuestions ? 'Next Question' : 'See Results'}
            </ThemedButton>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default QuizQuestion;
