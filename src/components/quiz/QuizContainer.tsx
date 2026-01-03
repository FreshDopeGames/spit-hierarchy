import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, ArrowLeft } from 'lucide-react';
import { ThemedCard, ThemedCardContent, ThemedCardHeader, ThemedCardTitle } from '@/components/ui/themed-card';
import { ThemedButton } from '@/components/ui/themed-button';
import { useQuiz, QuizCategory } from '@/hooks/useQuiz';
import QuizQuestion from './QuizQuestion';
import QuizCategorySelector from './QuizCategorySelector';
import QuizProgress from './QuizProgress';
import QuizResults from './QuizResults';
import { Skeleton } from '@/components/ui/skeleton';
import { Link } from 'react-router-dom';

const QuizContainer: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<QuizCategory>('all');
  const [hasStarted, setHasStarted] = useState(false);
  const quizCardRef = useRef<HTMLDivElement>(null);

  const {
    currentQuestion,
    questions,
    totalQuestions,
    currentQuestionIndex,
    isLoading,
    sessionScore,
    sessionCorrect,
    sessionStreak,
    isQuizComplete,
    newBadges,
    stats,
    submitAnswer,
    nextQuestion,
    resetQuiz,
    getShuffledAnswers,
    isSubmitting,
  } = useQuiz(selectedCategory);

  // Scroll quiz card into view when question changes
  useEffect(() => {
    if (hasStarted && quizCardRef.current && currentQuestionIndex >= 0) {
      quizCardRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start' 
      });
    }
  }, [currentQuestionIndex, hasStarted]);

  // Memoize shuffled answers to prevent re-shuffle on every render
  const shuffledAnswers = useMemo(() => {
    return getShuffledAnswers();
  }, [currentQuestion?.id]);

  const handleStartQuiz = () => {
    resetQuiz();
    setHasStarted(true);
  };

  const handleCategoryChange = (category: QuizCategory) => {
    setSelectedCategory(category);
    setHasStarted(false);
    resetQuiz();
  };

  const handlePlayAgain = () => {
    setHasStarted(false);
    resetQuiz();
  };

  // Loading state
  if (isLoading) {
    return (
      <ThemedCard variant="dark" className="border-2 border-[hsl(var(--theme-primary))]/30">
        <ThemedCardContent className="p-8 space-y-4">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="grid grid-cols-5 gap-3 mt-6">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  // Results screen
  if (isQuizComplete && hasStarted) {
    return (
      <QuizResults
        sessionScore={sessionScore}
        sessionCorrect={sessionCorrect}
        totalQuestions={totalQuestions}
        sessionStreak={sessionStreak}
        newBadges={newBadges || []}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  // Category selection / start screen
  if (!hasStarted) {
    return (
      <ThemedCard variant="dark" className="border-2 border-[hsl(var(--theme-primary))]/30">
        <ThemedCardHeader className="text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Brain className="w-8 h-8 text-[hsl(var(--theme-primary))]" />
            <ThemedCardTitle className="text-2xl">Rapper Knowledge Quiz</ThemedCardTitle>
          </div>
          <p className="text-muted-foreground">
            Test your hip-hop knowledge and earn badges!
          </p>
        </ThemedCardHeader>
        
        <ThemedCardContent className="space-y-6">
          {/* User Stats */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-black/30 rounded-xl border border-border">
              <div className="text-center">
                <p className="text-2xl font-[var(--theme-font-heading)] text-[hsl(var(--theme-primary))]">
                  {stats.questions_answered}
                </p>
                <p className="text-xs text-muted-foreground">Answered</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-[var(--theme-font-heading)] text-green-400">
                  {stats.correct_answers}
                </p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-[var(--theme-font-heading)] text-foreground">
                  {stats.accuracy}%
                </p>
                <p className="text-xs text-muted-foreground">Accuracy</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-[var(--theme-font-heading)] text-orange-400">
                  {stats.best_streak}
                </p>
                <p className="text-xs text-muted-foreground">Best Streak</p>
              </div>
            </div>
          )}

          {/* Category Selection */}
          <div className="space-y-3">
            <h3 className="text-sm font-[var(--theme-font-heading)] text-muted-foreground">
              Select Category
            </h3>
            <QuizCategorySelector
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Questions Available */}
          <div className="text-center p-4 bg-black/20 rounded-xl border border-border">
            {totalQuestions > 0 ? (
              <p className="text-foreground">
                <span className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
                  {totalQuestions}
                </span> questions available
              </p>
            ) : (
              <p className="text-muted-foreground">
                No new questions available in this category. Try another!
              </p>
            )}
          </div>

          {/* Start Button */}
          <ThemedButton
            onClick={handleStartQuiz}
            variant="gradient"
            className="w-full"
            disabled={totalQuestions === 0}
          >
            Start Quiz
          </ThemedButton>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  // Active quiz
  if (!currentQuestion) {
    return (
      <ThemedCard variant="dark" className="border-2 border-[hsl(var(--theme-primary))]/30">
        <ThemedCardContent className="p-8 text-center">
          <p className="text-muted-foreground">No questions available.</p>
          <ThemedButton onClick={handlePlayAgain} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </ThemedButton>
        </ThemedCardContent>
      </ThemedCard>
    );
  }

  return (
    <ThemedCard ref={quizCardRef} variant="dark" className="border-2 border-[hsl(var(--theme-primary))]/30 scroll-mt-24">
      <ThemedCardContent className="p-6 space-y-6">
        {/* Progress */}
        <QuizProgress
          currentQuestion={currentQuestionIndex}
          totalQuestions={totalQuestions}
          sessionScore={sessionScore}
          sessionCorrect={sessionCorrect}
          sessionStreak={sessionStreak}
        />

        {/* Question */}
        <QuizQuestion
          question={currentQuestion}
          shuffledAnswers={shuffledAnswers}
          onSubmit={submitAnswer}
          onNext={nextQuestion}
          isSubmitting={isSubmitting}
          questionNumber={currentQuestionIndex + 1}
          totalQuestions={totalQuestions}
        />
      </ThemedCardContent>
    </ThemedCard>
  );
};

export default QuizContainer;
