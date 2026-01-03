import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedTextarea } from '@/components/ui/themed-textarea';
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from '@/components/ui/themed-select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question_text: string;
  category: string;
  difficulty: string;
  question_type: string;
  correct_answer: string;
  wrong_answers: string[];
  points: number;
  is_active: boolean;
  rapper_name: string | null;
  rapper_id: string | null;
}

interface QuizQuestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: QuizQuestion | null;
  onSuccess: () => void;
}

interface FormData {
  question_text: string;
  category: string;
  difficulty: string;
  question_type: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  points: number;
  is_active: boolean;
  rapper_name: string;
}

const QuizQuestionDialog: React.FC<QuizQuestionDialogProps> = ({
  open,
  onOpenChange,
  question,
  onSuccess,
}) => {
  const { register, handleSubmit, setValue, watch, reset } = useForm<FormData>({
    defaultValues: {
      question_text: '',
      category: 'rapper_facts',
      difficulty: 'medium',
      question_type: 'multiple_choice',
      correct_answer: '',
      wrong_answer_1: '',
      wrong_answer_2: '',
      wrong_answer_3: '',
      points: 10,
      is_active: true,
      rapper_name: '',
    },
  });

  const category = watch('category');
  const difficulty = watch('difficulty');
  const is_active = watch('is_active');

  useEffect(() => {
    if (question) {
      reset({
        question_text: question.question_text,
        category: question.category,
        difficulty: question.difficulty,
        question_type: question.question_type,
        correct_answer: question.correct_answer,
        wrong_answer_1: question.wrong_answers[0] || '',
        wrong_answer_2: question.wrong_answers[1] || '',
        wrong_answer_3: question.wrong_answers[2] || '',
        points: question.points,
        is_active: question.is_active,
        rapper_name: question.rapper_name || '',
      });
    } else {
      reset({
        question_text: '',
        category: 'rapper_facts',
        difficulty: 'medium',
        question_type: 'multiple_choice',
        correct_answer: '',
        wrong_answer_1: '',
        wrong_answer_2: '',
        wrong_answer_3: '',
        points: 10,
        is_active: true,
        rapper_name: '',
      });
    }
  }, [question, reset]);

  const saveMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const wrong_answers = [
        data.wrong_answer_1,
        data.wrong_answer_2,
        data.wrong_answer_3,
      ].filter(Boolean);

      const questionData = {
        question_text: data.question_text,
        category: data.category,
        difficulty: data.difficulty,
        question_type: data.question_type,
        correct_answer: data.correct_answer,
        wrong_answers,
        points: data.points,
        is_active: data.is_active,
        rapper_name: data.rapper_name || null,
      };

      if (question) {
        const { error } = await supabase
          .from('quiz_questions')
          .update(questionData)
          .eq('id', question.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('quiz_questions')
          .insert(questionData);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(question ? 'Question updated' : 'Question created');
      onSuccess();
    },
    onError: (error) => {
      toast.error('Failed to save question');
      console.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    saveMutation.mutate(data);
  };

  const categories = [
    { value: 'rapper_facts', label: 'Rapper Facts' },
    { value: 'albums', label: 'Albums' },
    { value: 'origins', label: 'Origins' },
    { value: 'career', label: 'Career' },
    { value: 'birth_year', label: 'Birth Year' },
    { value: 'real_name', label: 'Real Name' },
  ];

  const difficulties = [
    { value: 'easy', label: 'Easy' },
    { value: 'medium', label: 'Medium' },
    { value: 'hard', label: 'Hard' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[hsl(var(--theme-surface))] border-[hsl(var(--theme-primary))]">
        <DialogHeader>
          <DialogTitle className="text-[hsl(var(--theme-primary))] font-[var(--theme-font-heading)]">
            {question ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-foreground">Question Text</Label>
            <ThemedTextarea
              {...register('question_text', { required: true })}
              placeholder="Enter the quiz question..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Category</Label>
              <ThemedSelect value={category} onValueChange={(v) => setValue('category', v)}>
                <ThemedSelectTrigger>
                  <ThemedSelectValue />
                </ThemedSelectTrigger>
                <ThemedSelectContent>
                  {categories.map((cat) => (
                    <ThemedSelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </ThemedSelectItem>
                  ))}
                </ThemedSelectContent>
              </ThemedSelect>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Difficulty</Label>
              <ThemedSelect value={difficulty} onValueChange={(v) => setValue('difficulty', v)}>
                <ThemedSelectTrigger>
                  <ThemedSelectValue />
                </ThemedSelectTrigger>
                <ThemedSelectContent>
                  {difficulties.map((diff) => (
                    <ThemedSelectItem key={diff.value} value={diff.value}>
                      {diff.label}
                    </ThemedSelectItem>
                  ))}
                </ThemedSelectContent>
              </ThemedSelect>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Rapper Name (optional)</Label>
            <ThemedInput
              {...register('rapper_name')}
              placeholder="e.g., Kendrick Lamar"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Correct Answer</Label>
            <ThemedInput
              {...register('correct_answer', { required: true })}
              placeholder="The correct answer"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground">Wrong Answers</Label>
            <div className="space-y-2">
              <ThemedInput
                {...register('wrong_answer_1', { required: true })}
                placeholder="Wrong answer 1"
              />
              <ThemedInput
                {...register('wrong_answer_2', { required: true })}
                placeholder="Wrong answer 2"
              />
              <ThemedInput
                {...register('wrong_answer_3', { required: true })}
                placeholder="Wrong answer 3"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-foreground">Points</Label>
              <ThemedInput
                type="number"
                {...register('points', { valueAsNumber: true })}
                min={1}
                max={100}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Active</Label>
              <div className="flex items-center gap-2 pt-2">
                <Switch
                  checked={is_active}
                  onCheckedChange={(checked) => setValue('is_active', checked)}
                />
                <span className="text-sm text-muted-foreground">
                  {is_active ? 'Question is active' : 'Question is inactive'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <ThemedButton
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </ThemedButton>
            <ThemedButton type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : question ? 'Update Question' : 'Create Question'}
            </ThemedButton>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default QuizQuestionDialog;
