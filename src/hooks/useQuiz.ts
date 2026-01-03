import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface QuizQuestion {
  id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  category: string;
  difficulty: string;
  rapper_id: string | null;
  album_id: string | null;
  correct_answer: string;
  wrong_answers: string[];
  points: number;
}

export interface QuizAnswer {
  success: boolean;
  is_correct?: boolean;
  correct_answer?: string;
  points_earned?: number;
  new_badges?: Array<{
    id: string;
    name: string;
    icon: string;
    rarity: string;
  }>;
  error?: string;
}

export interface QuizStats {
  questions_answered: number;
  correct_answers: number;
  current_streak: number;
  best_streak: number;
  accuracy: number;
}

export type QuizCategory = 'all' | 'rapper_facts' | 'albums' | 'origins' | 'career' | 'discography' | 'aliases' | 'birth_year' | 'real_name';

export const useQuiz = (category: QuizCategory = 'all', questionsPerRound: number = 10) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [sessionCorrect, setSessionCorrect] = useState(0);
  const [sessionStreak, setSessionStreak] = useState(0);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<string[]>([]);
  const [newBadges, setNewBadges] = useState<QuizAnswer['new_badges']>([]);

  // Fetch unanswered questions
  const { data: questions, isLoading, refetch } = useQuery({
    queryKey: ['quiz-questions', user?.id, category],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase.rpc('get_unanswered_questions', {
        p_user_id: user.id,
        p_category: category === 'all' ? null : category,
        p_limit: questionsPerRound
      });
      
      if (error) throw error;
      return (data as QuizQuestion[]) || [];
    },
    enabled: !!user?.id,
    staleTime: 0, // Always fetch fresh questions
  });

  // Fetch user's overall quiz stats
  const { data: stats } = useQuery({
    queryKey: ['quiz-stats', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('member_stats')
        .select('quiz_questions_answered, quiz_correct_answers, quiz_current_streak, quiz_best_streak')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      const answered = data?.quiz_questions_answered || 0;
      const correct = data?.quiz_correct_answers || 0;
      
      return {
        questions_answered: answered,
        correct_answers: correct,
        current_streak: data?.quiz_current_streak || 0,
        best_streak: data?.quiz_best_streak || 0,
        accuracy: answered > 0 ? Math.round((correct / answered) * 100) : 0
      } as QuizStats;
    },
    enabled: !!user?.id,
  });

  // Submit answer mutation
  const submitAnswerMutation = useMutation({
    mutationFn: async ({ questionId, answer, timeTaken }: { 
      questionId: string; 
      answer: string; 
      timeTaken?: number;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { data, error } = await supabase.rpc('submit_quiz_answer', {
        p_user_id: user.id,
        p_question_id: questionId,
        p_user_answer: answer,
        p_time_taken: timeTaken || null
      });
      
      if (error) throw error;
      return data as unknown as QuizAnswer;
    },
    onSuccess: (result) => {
      if (result.success) {
        // Update session stats
        if (result.is_correct) {
          setSessionScore(prev => prev + (result.points_earned || 0));
          setSessionCorrect(prev => prev + 1);
          setSessionStreak(prev => prev + 1);
        } else {
          setSessionStreak(0);
        }
        
        // Track new badges
        if (result.new_badges && result.new_badges.length > 0) {
          setNewBadges(prev => [...(prev || []), ...result.new_badges!]);
          result.new_badges.forEach(badge => {
            toast.success(`🏆 Badge Unlocked: ${badge.name}!`, {
              duration: 5000,
            });
          });
        }
        
        // Invalidate stats
        queryClient.invalidateQueries({ queryKey: ['quiz-stats', user?.id] });
        queryClient.invalidateQueries({ queryKey: ['quiz-badges', user?.id] });
      }
    },
  });

  const currentQuestion = questions?.[currentQuestionIndex];
  const totalQuestions = questions?.length || 0;
  const hasMoreQuestions = currentQuestionIndex < totalQuestions - 1;

  const submitAnswer = useCallback(async (answer: string, timeTaken?: number) => {
    if (!currentQuestion) return null;
    
    const result = await submitAnswerMutation.mutateAsync({
      questionId: currentQuestion.id,
      answer,
      timeTaken
    });
    
    setAnsweredQuestions(prev => [...prev, currentQuestion.id]);
    
    return result;
  }, [currentQuestion, submitAnswerMutation]);

  const nextQuestion = useCallback(() => {
    if (hasMoreQuestions) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizComplete(true);
    }
  }, [hasMoreQuestions]);

  const resetQuiz = useCallback(() => {
    setCurrentQuestionIndex(0);
    setSessionScore(0);
    setSessionCorrect(0);
    setSessionStreak(0);
    setIsQuizComplete(false);
    setAnsweredQuestions([]);
    setNewBadges([]);
    refetch();
  }, [refetch]);

  // Get shuffled answers for current question
  const getShuffledAnswers = useCallback(() => {
    if (!currentQuestion) return [];
    
    if (currentQuestion.question_type === 'true_false') {
      return ['True', 'False'];
    }
    
    const allAnswers = [
      currentQuestion.correct_answer,
      ...(currentQuestion.wrong_answers || [])
    ];
    
    // Shuffle using Fisher-Yates
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }
    
    return allAnswers;
  }, [currentQuestion]);

  return {
    // Question data
    currentQuestion,
    questions,
    totalQuestions,
    currentQuestionIndex,
    hasMoreQuestions,
    isLoading,
    
    // Session state
    sessionScore,
    sessionCorrect,
    sessionStreak,
    isQuizComplete,
    answeredQuestions,
    newBadges,
    
    // Stats
    stats,
    
    // Actions
    submitAnswer,
    nextQuestion,
    resetQuiz,
    getShuffledAnswers,
    
    // Mutation state
    isSubmitting: submitAnswerMutation.isPending,
  };
};
