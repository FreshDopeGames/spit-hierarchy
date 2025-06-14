
import { supabase } from "@/integrations/supabase/client";

export const generateTestVotes = async (count: number = 1000) => {
  try {
    console.log(`Generating ${count} test votes...`);
    
    // Get all categories and rappers
    const { data: categories } = await supabase
      .from('voting_categories')
      .select('id')
      .eq('active', true);
    
    const { data: rappers } = await supabase
      .from('rappers')
      .select('id');
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to generate test data');
    }
    
    if (!categories || !rappers) {
      throw new Error('Failed to fetch base data');
    }
    
    console.log(`Found ${categories.length} categories and ${rappers.length} rappers`);
    
    const votes = [];
    const now = new Date();
    
    // Check existing votes for this user to avoid conflicts
    const { data: existingVotes } = await supabase
      .from('votes')
      .select('rapper_id, category_id')
      .eq('user_id', user.id);
    
    const existingCombos = new Set(
      existingVotes?.map(v => `${v.rapper_id}-${v.category_id}`) || []
    );
    
    let attemptCount = 0;
    let votesCreated = 0;
    
    while (votesCreated < count && attemptCount < count * 2) {
      const randomRapper = rappers[Math.floor(Math.random() * rappers.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      const combo = `${randomRapper.id}-${randomCategory.id}`;
      
      // Skip if this combination already exists
      if (existingCombos.has(combo)) {
        attemptCount++;
        continue;
      }
      
      // Random date within last 7 days
      const randomDaysAgo = Math.random() * 7;
      const voteDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      votes.push({
        user_id: user.id,
        rapper_id: randomRapper.id,
        category_id: randomCategory.id,
        rating: Math.floor(Math.random() * 10) + 1, // 1-10
        created_at: voteDate.toISOString()
      });
      
      existingCombos.add(combo);
      votesCreated++;
      attemptCount++;
    }
    
    console.log(`Prepared ${votes.length} unique votes to insert`);
    
    // Insert in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    let inserted = 0;
    
    for (let i = 0; i < votes.length; i += batchSize) {
      const batch = votes.slice(i, i + batchSize);
      const { data, error } = await supabase
        .from('votes')
        .insert(batch)
        .select();
      
      if (error) {
        console.warn(`Batch ${Math.floor(i / batchSize) + 1} error:`, error.message);
        // Continue with next batch even if this one fails
      } else {
        inserted += data?.length || 0;
        console.log(`Batch ${Math.floor(i / batchSize) + 1}: inserted ${data?.length || 0} votes`);
      }
    }
    
    console.log(`Successfully inserted ${inserted} votes out of ${votes.length} attempted`);
    return inserted;
    
  } catch (error) {
    console.error('Error generating test votes:', error);
    throw error;
  }
};

export const generateTestUserRankings = async (count: number = 50) => {
  try {
    console.log(`Generating ${count} test user rankings...`);
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      throw new Error('User must be logged in to generate test data');
    }
    
    const { data: rappers } = await supabase
      .from('rappers')
      .select('id');
    
    if (!rappers) {
      throw new Error('Failed to fetch rappers data');
    }
    
    const categories = ['lyrical', 'flow', 'impact', 'overall', 'style'];
    let created = 0;
    
    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const timestamp = Date.now();
      
      try {
        // Create user ranking (only for current user to avoid RLS issues)
        const { data: ranking, error: rankingError } = await supabase
          .from('user_rankings')
          .insert({
            user_id: user.id,
            title: `My Top ${category.charAt(0).toUpperCase() + category.slice(1)} Rappers ${i + 1}`,
            description: `Personal ranking of the best ${category} rappers in hip-hop`,
            category: category,
            slug: `${category}-ranking-${user.id}-${timestamp}-${i}`,
            is_public: Math.random() > 0.2 // 80% public
          })
          .select()
          .single();
        
        if (rankingError) {
          console.warn(`Failed to create ranking ${i + 1}:`, rankingError.message);
          continue;
        }
        
        // Add 5-15 random rappers to this ranking
        const rankingSize = Math.floor(Math.random() * 11) + 5; // 5-15
        const selectedRappers = rappers
          .sort(() => 0.5 - Math.random())
          .slice(0, rankingSize);
        
        const rankingItems = selectedRappers.map((rapper, index) => ({
          ranking_id: ranking.id,
          rapper_id: rapper.id,
          position: index + 1,
          is_ranked: true
        }));
        
        const { error: itemsError } = await supabase
          .from('user_ranking_items')
          .insert(rankingItems);
        
        if (itemsError) {
          console.warn(`Failed to create ranking items for ranking ${i + 1}:`, itemsError.message);
          // Delete the ranking if we can't add items
          await supabase
            .from('user_rankings')
            .delete()
            .eq('id', ranking.id);
        } else {
          created++;
          console.log(`Created ranking ${created}: "${ranking.title}" with ${rankingItems.length} items`);
        }
        
      } catch (error) {
        console.warn(`Error creating ranking ${i + 1}:`, error);
        continue;
      }
    }
    
    console.log(`Successfully created ${created} user rankings`);
    return created;
    
  } catch (error) {
    console.error('Error generating test user rankings:', error);
    throw error;
  }
};
