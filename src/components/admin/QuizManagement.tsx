import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Brain, Search, Plus, Edit2, Trash2, Upload, Award, FileText } from 'lucide-react';
import { ThemedCard } from '@/components/ui/themed-card';
import { ThemedButton } from '@/components/ui/themed-button';
import { ThemedInput } from '@/components/ui/themed-input';
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from '@/components/ui/themed-tabs';
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from '@/components/ui/themed-select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import QuizQuestionDialog from './QuizQuestionDialog';
import AdminTabHeader from './AdminTabHeader';

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

interface QuizBadge {
  id: string;
  name: string;
  description: string;
  category: string;
  threshold_correct: number;
  rarity: string;
  icon: string;
  points: number;
  is_active: boolean | null;
}

const QuizManagement: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    total: number;
    imported: number;
    skipped: number;
    errors: string[];
    unmatchedRappers: string[];
  } | null>(null);

  const handleImportQuestions = async () => {
    setIsImporting(true);
    setImportResult(null);
    
    try {
      // Fetch the CSV file
      const response = await fetch('/src/data/quiz-questions-import.csv');
      if (!response.ok) {
        throw new Error('Failed to load CSV file');
      }
      const csvData = await response.text();
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('import-quiz-questions', {
        body: { csvData, dryRun: false }
      });
      
      if (error) throw error;
      
      if (data.success) {
        setImportResult(data.result);
        toast.success(`Imported ${data.result.imported} questions successfully!`);
        queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      } else {
        throw new Error(data.error || 'Import failed');
      }
    } catch (error: any) {
      console.error('Import error:', error);
      toast.error(error.message || 'Failed to import questions');
    } finally {
      setIsImporting(false);
    }
  };

  // Fetch questions
  const { data: questions = [], isLoading: loadingQuestions } = useQuery({
    queryKey: ['admin-quiz-questions', searchTerm, categoryFilter],
    queryFn: async () => {
      let query = supabase
        .from('quiz_questions')
        .select('*')
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('question_text', `%${searchTerm}%`);
      }

      if (categoryFilter !== 'all') {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query.limit(100);
      if (error) throw error;
      return data as QuizQuestion[];
    },
  });

  // Fetch badges
  const { data: badges = [], isLoading: loadingBadges } = useQuery({
    queryKey: ['admin-quiz-badges'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('quiz_badges')
        .select('*')
        .order('category', { ascending: true })
        .order('threshold_correct', { ascending: true });
      if (error) throw error;
      return data as QuizBadge[];
    },
  });

  // Toggle question active status
  const toggleQuestionMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('quiz_questions')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      toast.success('Question status updated');
    },
    onError: () => {
      toast.error('Failed to update question');
    },
  });

  // Delete question
  const deleteQuestionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
      toast.success('Question deleted');
    },
    onError: () => {
      toast.error('Failed to delete question');
    },
  });

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'rapper_facts', label: 'Rapper Facts' },
    { value: 'albums', label: 'Albums' },
    { value: 'origins', label: 'Origins' },
    { value: 'career', label: 'Career' },
    { value: 'birth_year', label: 'Birth Year' },
    { value: 'real_name', label: 'Real Name' },
  ];

  const getCategoryBadge = (category: string) => {
    const colors: Record<string, string> = {
      rapper_facts: 'bg-purple-500/20 text-purple-300',
      albums: 'bg-blue-500/20 text-blue-300',
      origins: 'bg-green-500/20 text-green-300',
      career: 'bg-orange-500/20 text-orange-300',
      birth_year: 'bg-pink-500/20 text-pink-300',
      real_name: 'bg-cyan-500/20 text-cyan-300',
    };
    return colors[category] || 'bg-gray-500/20 text-gray-300';
  };

  const getDifficultyBadge = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: 'bg-green-500/20 text-green-300',
      medium: 'bg-yellow-500/20 text-yellow-300',
      hard: 'bg-red-500/20 text-red-300',
    };
    return colors[difficulty] || 'bg-gray-500/20 text-gray-300';
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setIsDialogOpen(true);
  };

  const handleNewQuestion = () => {
    setEditingQuestion(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminTabHeader
        title="Quiz Management"
        icon={Brain}
        description="Manage quiz questions, badges, and import new content"
      />

      <ThemedTabs defaultValue="questions" className="space-y-4">
        <ThemedTabsList className="grid w-full grid-cols-3 max-w-md">
          <ThemedTabsTrigger value="questions" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Questions
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="badges" className="flex items-center gap-2">
            <Award className="w-4 h-4" />
            Badges
          </ThemedTabsTrigger>
          <ThemedTabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Import
          </ThemedTabsTrigger>
        </ThemedTabsList>

        {/* Questions Tab */}
        <ThemedTabsContent value="questions" className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <ThemedInput
                placeholder="Search questions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <ThemedSelect value={categoryFilter} onValueChange={setCategoryFilter}>
              <ThemedSelectTrigger className="w-full sm:w-48">
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
            <ThemedButton onClick={handleNewQuestion} className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Question
            </ThemedButton>
          </div>

          <ThemedCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Question</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Category</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Difficulty</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Rapper</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Active</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingQuestions ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading questions...
                      </TableCell>
                    </TableRow>
                  ) : questions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No questions found
                      </TableCell>
                    </TableRow>
                  ) : (
                    questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="max-w-xs truncate text-foreground">
                          {question.question_text}
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryBadge(question.category)}`}>
                            {question.category.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getDifficultyBadge(question.difficulty)}`}>
                            {question.difficulty}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {question.rapper_name || '-'}
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={question.is_active}
                            onCheckedChange={(checked) =>
                              toggleQuestionMutation.mutate({ id: question.id, is_active: checked })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <ThemedButton
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <Edit2 className="w-4 h-4" />
                            </ThemedButton>
                            <ThemedButton
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteQuestionMutation.mutate(question.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </ThemedButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ThemedCard>

          <p className="text-sm text-muted-foreground">
            Showing {questions.length} questions (max 100)
          </p>
        </ThemedTabsContent>

        {/* Badges Tab */}
        <ThemedTabsContent value="badges" className="space-y-4">
          <ThemedCard className="overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Badge</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Category</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Threshold</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Rarity</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Points</TableHead>
                    <TableHead className="text-[hsl(var(--theme-primary))]">Active</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingBadges ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Loading badges...
                      </TableCell>
                    </TableRow>
                  ) : (
                    badges.map((badge) => (
                      <TableRow key={badge.id}>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{badge.name}</span>
                            <span className="text-xs text-muted-foreground">{badge.description}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs ${getCategoryBadge(badge.category)}`}>
                            {badge.category.replace('_', ' ')}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">{badge.threshold_correct} correct</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-xs capitalize ${
                            badge.rarity === 'legendary' ? 'bg-yellow-500/20 text-yellow-300' :
                            badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                            badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-gray-500/20 text-gray-300'
                          }`}>
                            {badge.rarity}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">{badge.points}</TableCell>
                        <TableCell>
                          <span className={badge.is_active ? 'text-green-400' : 'text-red-400'}>
                            {badge.is_active ? 'Yes' : 'No'}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </ThemedCard>
        </ThemedTabsContent>

        {/* Import Tab */}
        <ThemedTabsContent value="import" className="space-y-4">
          <ThemedCard className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Import Quiz Questions</h3>
            <p className="text-muted-foreground mb-4">
              Import 873 pre-prepared questions covering birth years, origins, and real names of hip-hop artists.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              The import will automatically match rapper names to existing database entries and extract rapper names from question text.
            </p>
            
            <ThemedButton 
              onClick={handleImportQuestions} 
              disabled={isImporting}
              className="mb-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              {isImporting ? 'Importing...' : 'Import Questions from CSV'}
            </ThemedButton>

            {importResult && (
              <div className="space-y-4 mt-4 p-4 border border-border rounded-lg">
                <h4 className="font-semibold text-foreground">Import Results</h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded">
                    <div className="text-2xl font-bold text-foreground">{importResult.total}</div>
                    <div className="text-xs text-muted-foreground">Total Parsed</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/20 rounded">
                    <div className="text-2xl font-bold text-green-400">{importResult.imported}</div>
                    <div className="text-xs text-muted-foreground">Imported</div>
                  </div>
                  <div className="text-center p-3 bg-yellow-500/20 rounded">
                    <div className="text-2xl font-bold text-yellow-400">{importResult.skipped}</div>
                    <div className="text-xs text-muted-foreground">Skipped</div>
                  </div>
                  <div className="text-center p-3 bg-orange-500/20 rounded">
                    <div className="text-2xl font-bold text-orange-400">{importResult.unmatchedRappers.length}</div>
                    <div className="text-xs text-muted-foreground">Unmatched Rappers</div>
                  </div>
                </div>
                
                {importResult.errors.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-destructive mb-2">Errors:</h5>
                    <ul className="text-xs text-muted-foreground space-y-1 max-h-32 overflow-y-auto">
                      {importResult.errors.slice(0, 10).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {importResult.errors.length > 10 && (
                        <li>...and {importResult.errors.length - 10} more</li>
                      )}
                    </ul>
                  </div>
                )}
                
                {importResult.unmatchedRappers.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium text-orange-400 mb-2">Unmatched Rappers (questions still imported with name only):</h5>
                    <p className="text-xs text-muted-foreground">
                      {importResult.unmatchedRappers.slice(0, 20).join(', ')}
                      {importResult.unmatchedRappers.length > 20 && ` ...and ${importResult.unmatchedRappers.length - 20} more`}
                    </p>
                  </div>
                )}
              </div>
            )}
          </ThemedCard>
        </ThemedTabsContent>
      </ThemedTabs>

      <QuizQuestionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        question={editingQuestion}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['admin-quiz-questions'] });
          setIsDialogOpen(false);
          setEditingQuestion(null);
        }}
      />
    </div>
  );
};

export default QuizManagement;
