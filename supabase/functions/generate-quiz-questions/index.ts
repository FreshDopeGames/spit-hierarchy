import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeneratedQuestion {
  question_text: string;
  correct_answer: string;
  wrong_answers: string[];
  category: string;
  difficulty: string;
  question_type: string;
  rapper_id: string | null;
  rapper_name: string | null;
  album_id: string | null;
  points: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { categories = ['discography', 'aliases', 'career'] } = await req.json().catch(() => ({}));

    console.log('Starting question generation for categories:', categories);

    const questions: GeneratedQuestion[] = [];
    const stats = { discography: 0, aliases: 0, career: 0 };

    // Fetch rappers with aliases
    const { data: rappersWithAliases } = await supabase
      .from('rappers')
      .select('id, name, aliases')
      .not('aliases', 'is', null)
      .limit(500);

    // Fetch all rapper names for wrong answers
    const { data: allRappers } = await supabase
      .from('rappers')
      .select('id, name, career_start_year, death_year')
      .limit(1000);

    const rapperNames = allRappers?.map(r => r.name) || [];

    // Fetch albums with release dates and rapper info
    const { data: albums } = await supabase
      .from('albums')
      .select(`
        id,
        title,
        release_date,
        release_type,
        rapper_albums!inner(rapper_id, rappers!inner(id, name))
      `)
      .not('release_date', 'is', null)
      .order('release_date', { ascending: true })
      .limit(1000);

    // Fetch existing questions to avoid duplicates
    const { data: existingQuestions } = await supabase
      .from('quiz_questions')
      .select('question_text')
      .in('category', ['discography', 'aliases', 'career']);

    const existingTexts = new Set(existingQuestions?.map(q => q.question_text.toLowerCase()) || []);

    // Helper functions
    const getRandomRapperNames = (count: number, excludeId: string): string[] => {
      const filtered = allRappers?.filter(r => r.id !== excludeId) || [];
      const shuffled = filtered.sort(() => Math.random() - 0.5);
      return shuffled.slice(0, count).map(r => r.name);
    };

    const generateNearbyYears = (year: number, count: number = 3): string[] => {
      const offsets = [-3, -2, -1, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);
      return offsets.slice(0, count).map(offset => (year + offset).toString());
    };

    const getDecade = (year: number): string => {
      const decade = Math.floor(year / 10) * 10;
      return `${decade}s`;
    };

    const generateWrongDecades = (correctDecade: string): string[] => {
      const decades = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];
      return decades.filter(d => d !== correctDecade).sort(() => Math.random() - 0.5).slice(0, 3);
    };

    // ============ DISCOGRAPHY QUESTIONS ============
    if (categories.includes('discography') && albums) {
      console.log(`Processing ${albums.length} albums for discography questions`);

      // Group albums by rapper
      const albumsByRapper = new Map<string, typeof albums>();
      albums.forEach(album => {
        const rapperInfo = album.rapper_albums?.[0]?.rappers;
        if (rapperInfo) {
          const rapperId = rapperInfo.id;
          if (!albumsByRapper.has(rapperId)) {
            albumsByRapper.set(rapperId, []);
          }
          albumsByRapper.get(rapperId)!.push(album);
        }
      });

      for (const album of albums) {
        const rapperInfo = album.rapper_albums?.[0]?.rappers;
        if (!rapperInfo || !album.release_date) continue;

        const releaseYear = new Date(album.release_date).getFullYear();
        if (releaseYear < 1970 || releaseYear > 2025) continue;

        // Question Type 1: Album release year
        const yearQuestion = `What year was "${album.title}" by ${rapperInfo.name} released?`;
        if (!existingTexts.has(yearQuestion.toLowerCase())) {
          questions.push({
            question_text: yearQuestion,
            correct_answer: releaseYear.toString(),
            wrong_answers: generateNearbyYears(releaseYear),
            category: 'discography',
            difficulty: 'medium',
            question_type: 'multiple_choice',
            rapper_id: rapperInfo.id,
            rapper_name: rapperInfo.name,
            album_id: album.id,
            points: 15,
          });
          stats.discography++;
        }
      }

      // Question Type 2: Debut album (first album for each rapper)
      for (const [rapperId, rapperAlbums] of albumsByRapper) {
        if (rapperAlbums.length < 2) continue;

        const sortedAlbums = rapperAlbums
          .filter(a => a.release_type === 'album')
          .sort((a, b) => new Date(a.release_date!).getTime() - new Date(b.release_date!).getTime());

        if (sortedAlbums.length === 0) continue;

        const firstAlbum = sortedAlbums[0];
        const rapperInfo = firstAlbum.rapper_albums?.[0]?.rappers;
        if (!rapperInfo) continue;

        // Get other album titles as wrong answers
        const otherAlbums = sortedAlbums.slice(1, 4).map(a => a.title);
        if (otherAlbums.length < 3) {
          // Pad with random album titles from other rappers
          const randomAlbums = albums
            .filter(a => a.rapper_albums?.[0]?.rappers?.id !== rapperId)
            .sort(() => Math.random() - 0.5)
            .slice(0, 3 - otherAlbums.length)
            .map(a => a.title);
          otherAlbums.push(...randomAlbums);
        }

        const debutQuestion = `What was ${rapperInfo.name}'s debut studio album?`;
        if (!existingTexts.has(debutQuestion.toLowerCase()) && otherAlbums.length >= 3) {
          questions.push({
            question_text: debutQuestion,
            correct_answer: firstAlbum.title,
            wrong_answers: otherAlbums.slice(0, 3),
            category: 'discography',
            difficulty: 'hard',
            question_type: 'multiple_choice',
            rapper_id: rapperInfo.id,
            rapper_name: rapperInfo.name,
            album_id: firstAlbum.id,
            points: 20,
          });
          stats.discography++;
        }
      }
    }

    // ============ ALIAS QUESTIONS ============
    if (categories.includes('aliases') && rappersWithAliases) {
      console.log(`Processing ${rappersWithAliases.length} rappers with aliases`);

      for (const rapper of rappersWithAliases) {
        if (!rapper.aliases || !Array.isArray(rapper.aliases)) continue;

        for (const alias of rapper.aliases) {
          if (typeof alias !== 'string' || alias.length < 2) continue;

          // Question Type 1: Identify by alias
          const identifyQuestion = `Which rapper is also known as "${alias}"?`;
          if (!existingTexts.has(identifyQuestion.toLowerCase())) {
            const wrongAnswers = getRandomRapperNames(3, rapper.id);
            if (wrongAnswers.length >= 3) {
              questions.push({
                question_text: identifyQuestion,
                correct_answer: rapper.name,
                wrong_answers: wrongAnswers,
                category: 'aliases',
                difficulty: 'medium',
                question_type: 'multiple_choice',
                rapper_id: rapper.id,
                rapper_name: rapper.name,
                album_id: null,
                points: 15,
              });
              stats.aliases++;
            }
          }

          // Question Type 2: Name the alias
          const aliasQuestion = `What is an alternate name for ${rapper.name}?`;
          if (!existingTexts.has(aliasQuestion.toLowerCase())) {
            // Get random aliases from other rappers as wrong answers
            const otherAliases = rappersWithAliases
              .filter(r => r.id !== rapper.id && r.aliases)
              .flatMap(r => r.aliases as string[])
              .filter(a => typeof a === 'string' && a.length > 1)
              .sort(() => Math.random() - 0.5)
              .slice(0, 3);

            if (otherAliases.length >= 3) {
              questions.push({
                question_text: aliasQuestion,
                correct_answer: alias,
                wrong_answers: otherAliases,
                category: 'aliases',
                difficulty: 'medium',
                question_type: 'multiple_choice',
                rapper_id: rapper.id,
                rapper_name: rapper.name,
                album_id: null,
                points: 15,
              });
              stats.aliases++;
            }
          }
        }
      }
    }

    // ============ CAREER TIMELINE QUESTIONS ============
    if (categories.includes('career') && albums && allRappers) {
      console.log('Generating career timeline questions');

      // Calculate first album year for each rapper
      const rapperFirstAlbum = new Map<string, { year: number; name: string }>();
      
      for (const album of albums) {
        const rapperInfo = album.rapper_albums?.[0]?.rappers;
        if (!rapperInfo || !album.release_date) continue;

        const year = new Date(album.release_date).getFullYear();
        if (year < 1970 || year > 2025) continue;

        const existing = rapperFirstAlbum.get(rapperInfo.id);
        if (!existing || year < existing.year) {
          rapperFirstAlbum.set(rapperInfo.id, { year, name: rapperInfo.name });
        }
      }

      // Question Type 1: Debut album year
      for (const [rapperId, info] of rapperFirstAlbum) {
        const debutYearQ = `What year did ${info.name} release their first album?`;
        if (!existingTexts.has(debutYearQ.toLowerCase())) {
          questions.push({
            question_text: debutYearQ,
            correct_answer: info.year.toString(),
            wrong_answers: generateNearbyYears(info.year),
            category: 'career',
            difficulty: 'medium',
            question_type: 'multiple_choice',
            rapper_id: rapperId,
            rapper_name: info.name,
            album_id: null,
            points: 15,
          });
          stats.career++;
        }
      }

      // Question Type 2: Career start decade
      for (const [rapperId, info] of rapperFirstAlbum) {
        const decade = getDecade(info.year);
        const decadeQ = `In which decade did ${info.name} start their music career?`;
        if (!existingTexts.has(decadeQ.toLowerCase())) {
          questions.push({
            question_text: decadeQ,
            correct_answer: decade,
            wrong_answers: generateWrongDecades(decade),
            category: 'career',
            difficulty: 'easy',
            question_type: 'multiple_choice',
            rapper_id: rapperId,
            rapper_name: info.name,
            album_id: null,
            points: 10,
          });
          stats.career++;
        }
      }

      // Question Type 3: Career comparison (who started first)
      const rapperList = Array.from(rapperFirstAlbum.entries());
      for (let i = 0; i < Math.min(50, rapperList.length); i++) {
        const [id1, info1] = rapperList[i];
        const randomIndex = Math.floor(Math.random() * rapperList.length);
        const [id2, info2] = rapperList[randomIndex];

        if (id1 === id2 || info1.year === info2.year) continue;

        const earlier = info1.year < info2.year ? info1 : info2;
        const later = info1.year < info2.year ? info2 : info1;

        const comparisonQ = `Who started their rap career earlier: ${info1.name} or ${info2.name}?`;
        if (!existingTexts.has(comparisonQ.toLowerCase())) {
          questions.push({
            question_text: comparisonQ,
            correct_answer: earlier.name,
            wrong_answers: [later.name, 'Same year', 'Neither has released an album'],
            category: 'career',
            difficulty: 'hard',
            question_type: 'multiple_choice',
            rapper_id: info1.year < info2.year ? id1 : id2,
            rapper_name: earlier.name,
            album_id: null,
            points: 20,
          });
          stats.career++;
        }
      }
    }

    console.log(`Generated ${questions.length} questions:`, stats);

    // Insert questions in batches
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < questions.length; i += batchSize) {
      const batch = questions.slice(i, i + batchSize);
      const { error } = await supabase
        .from('quiz_questions')
        .insert(batch);

      if (error) {
        console.error('Error inserting batch:', error);
      } else {
        inserted += batch.length;
      }
    }

    console.log(`Successfully inserted ${inserted} questions`);

    return new Response(
      JSON.stringify({
        success: true,
        generated: questions.length,
        inserted,
        breakdown: stats,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating questions:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});