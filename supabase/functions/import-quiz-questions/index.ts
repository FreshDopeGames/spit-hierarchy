import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVQuestion {
  question_id: string;
  question_text: string;
  correct_answer: string;
  wrong_answer_1: string;
  wrong_answer_2: string;
  wrong_answer_3: string;
  category: string;
  difficulty: string;
  source_field: string;
  tags: string;
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
          question_id: values[0]?.trim() || '',
          question_text: values[1]?.trim() || '',
          correct_answer: values[2]?.trim() || '',
          wrong_answer_1: values[3]?.trim() || '',
          wrong_answer_2: values[4]?.trim() || '',
          wrong_answer_3: values[5]?.trim() || '',
          category: values[6]?.trim() || '',
          difficulty: values[7]?.trim() || 'medium',
          source_field: values[8]?.trim() || '',
          tags: values[9]?.trim() || '',
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
        result.errors.push(`Unknown category: ${q.category} for question: ${q.question_text.substring(0, 50)}...`);
        result.skipped++;
        continue;
      }

      // Extract rapper name from question text
      const rapperName = extractRapperName(q.question_text);
      const rapperMatch = rapperName ? rapperMap.get(rapperName.toLowerCase()) : null;
      
      if (rapperName && !rapperMatch) {
        unmatchedSet.add(rapperName);
      }

      // Use difficulty from CSV
      const difficulty = q.difficulty.toLowerCase() || 'medium';

      questionsToInsert.push({
        question_text: q.question_text,
        question_type: 'multiple_choice',
        category,
        difficulty,
        rapper_id: rapperMatch?.id || null,
        rapper_name: rapperName || null,
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

function extractRapperName(questionText: string): string | null {
  // Pattern: "What year was X born?"
  let match = questionText.match(/What year was (.+?) born\?/i);
  if (match) return match[1];
  
  // Pattern: "Which city or region is X associated with?"
  match = questionText.match(/Which city or region is (.+?) associated with\?/i);
  if (match) return match[1];
  
  // Pattern: "What is the real name of X?"
  match = questionText.match(/What is the real name of (.+?)\?/i);
  if (match) return match[1];
  
  return null;
}

function mapCategory(csvCategory: string): string | null {
  const categoryMap: Record<string, string> = {
    'birth_year': 'birth_year',
    'birth year': 'birth_year',
    'origin': 'origins',
    'origins': 'origins',
    'real_name': 'real_name',
    'real name': 'real_name',
    'rapper_facts': 'rapper_facts',
    'rapper facts': 'rapper_facts',
    'albums': 'albums',
    'career': 'career',
    'discography': 'discography',
  };
  
  return categoryMap[csvCategory.toLowerCase()] || null;
}

function getPointsForDifficulty(difficulty: string): number {
  switch (difficulty) {
    case 'easy': return 5;
    case 'medium': return 10;
    case 'hard': return 15;
    default: return 10;
  }
}
