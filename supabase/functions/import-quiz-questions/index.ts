import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVQuestion {
  rapper: string;
  category: string;
  question: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
}

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: string[];
  unmatchedRappers: string[];
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { csvData, dryRun = false } = await req.json();

    if (!csvData) {
      return new Response(
        JSON.stringify({ error: 'No CSV data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Starting quiz question import...');
    console.log(`Dry run: ${dryRun}`);

    // Parse CSV data
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',').map((h: string) => h.trim().toLowerCase().replace(/\s+/g, '_'));
    
    console.log('CSV Headers:', headers);
    
    const questions: CSVQuestion[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]);
      if (values.length >= 7) {
        questions.push({
          rapper: values[0]?.trim() || '',
          category: values[1]?.trim() || '',
          question: values[2]?.trim() || '',
          correct_answer: values[3]?.trim() || '',
          wrong_answer_1: values[4]?.trim() || '',
          wrong_answer_2: values[5]?.trim() || '',
          wrong_answer_3: values[6]?.trim() || '',
        });
      }
    }

    console.log(`Parsed ${questions.length} questions from CSV`);

    // Fetch all rappers for matching
    const { data: rappers, error: rappersError } = await supabase
      .from('rappers')
      .select('id, name, aliases');

    if (rappersError) {
      console.error('Error fetching rappers:', rappersError);
      throw rappersError;
    }

    console.log(`Loaded ${rappers?.length || 0} rappers for matching`);

    // Create a map for quick rapper lookup (lowercase name -> rapper)
    const rapperMap = new Map<string, { id: string; name: string }>();
    for (const rapper of rappers || []) {
      rapperMap.set(rapper.name.toLowerCase(), { id: rapper.id, name: rapper.name });
      // Also add aliases
      if (rapper.aliases && Array.isArray(rapper.aliases)) {
        for (const alias of rapper.aliases) {
          rapperMap.set(alias.toLowerCase(), { id: rapper.id, name: rapper.name });
        }
      }
    }

    const result: ImportResult = {
      total: questions.length,
      imported: 0,
      skipped: 0,
      errors: [],
      unmatchedRappers: [],
    };

    const questionsToInsert = [];
    const unmatchedSet = new Set<string>();

    for (const q of questions) {
      // Map category
      const category = mapCategory(q.category);
      if (!category) {
        result.errors.push(`Unknown category: ${q.category} for question: ${q.question.substring(0, 50)}...`);
        result.skipped++;
        continue;
      }

      // Try to match rapper
      const rapperMatch = rapperMap.get(q.rapper.toLowerCase());
      
      if (!rapperMatch) {
        unmatchedSet.add(q.rapper);
      }

      // Determine difficulty based on category
      const difficulty = determineDifficulty(category, q);

      questionsToInsert.push({
        question_text: q.question,
        question_type: 'multiple_choice',
        category,
        difficulty,
        rapper_id: rapperMatch?.id || null,
        rapper_name: q.rapper,
        correct_answer: q.correct_answer,
        wrong_answers: [q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3].filter(Boolean),
        points: getPointsForDifficulty(difficulty),
        is_active: true,
      });
    }

    result.unmatchedRappers = Array.from(unmatchedSet);
    console.log(`Unmatched rappers: ${result.unmatchedRappers.length}`);

    if (!dryRun && questionsToInsert.length > 0) {
      // Insert in batches of 100
      const batchSize = 100;
      for (let i = 0; i < questionsToInsert.length; i += batchSize) {
        const batch = questionsToInsert.slice(i, i + batchSize);
        const { error: insertError } = await supabase
          .from('quiz_questions')
          .insert(batch);

        if (insertError) {
          console.error(`Error inserting batch ${i / batchSize + 1}:`, insertError);
          result.errors.push(`Batch ${i / batchSize + 1} failed: ${insertError.message}`);
        } else {
          result.imported += batch.length;
          console.log(`Inserted batch ${i / batchSize + 1}: ${batch.length} questions`);
        }
      }
    } else if (dryRun) {
      result.imported = questionsToInsert.length;
      console.log(`Dry run: Would import ${questionsToInsert.length} questions`);
    }

    console.log('Import complete:', result);

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  
  return result;
}

function mapCategory(csvCategory: string): string | null {
  const categoryMap: Record<string, string> = {
    'birth year': 'birth_year',
    'origin': 'origins',
    'real name': 'real_name',
    'rapper facts': 'rapper_facts',
    'albums': 'albums',
    'career': 'career',
    'discography': 'discography',
  };
  
  return categoryMap[csvCategory.toLowerCase()] || null;
}

function determineDifficulty(category: string, q: CSVQuestion): string {
  // Birth year questions: harder if years are close together
  if (category === 'birth_year') {
    const years = [q.correct_answer, q.wrong_answer_1, q.wrong_answer_2, q.wrong_answer_3]
      .map(y => parseInt(y))
      .filter(y => !isNaN(y));
    
    if (years.length >= 4) {
      const range = Math.max(...years) - Math.min(...years);
      if (range <= 5) return 'hard';
      if (range <= 10) return 'medium';
    }
  }
  
  return 'medium'; // Default difficulty
}

function getPointsForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 10;
    case 'hard': return 15;
    default: return 10;
  }
}
