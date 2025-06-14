
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
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(100); // Use existing profiles
    
    if (!categories || !rappers || !profiles) {
      throw new Error('Failed to fetch base data');
    }
    
    const votes = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      // Random data for each vote
      const randomProfile = profiles[Math.floor(Math.random() * profiles.length)];
      const randomRapper = rappers[Math.floor(Math.random() * rappers.length)];
      const randomCategory = categories[Math.floor(Math.random() * categories.length)];
      
      // Random date within last 7 days
      const randomDaysAgo = Math.random() * 7;
      const voteDate = new Date(now.getTime() - (randomDaysAgo * 24 * 60 * 60 * 1000));
      
      votes.push({
        user_id: randomProfile.id,
        rapper_id: randomRapper.id,
        category_id: randomCategory.id,
        rating: Math.floor(Math.random() * 10) + 1, // 1-10
        created_at: voteDate.toISOString()
      });
    }
    
    // Insert in batches of 100
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < votes.length; i += batchSize) {
      const batch = votes.slice(i, i + batchSize);
      const { error } = await supabase
        .from('votes')
        .insert(batch);
      
      if (error) {
        console.warn(`Batch ${i / batchSize + 1} had conflicts, continuing...`);
      } else {
        inserted += batch.length;
      }
    }
    
    console.log(`Successfully inserted ${inserted} votes out of ${count} attempted`);
    return inserted;
    
  } catch (error) {
    console.error('Error generating test votes:', error);
    throw error;
  }
};

export const generateTestUserRankings = async (count: number = 50) => {
  try {
    console.log(`Generating ${count} test user rankings...`);
    
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id')
      .limit(50);
    
    const { data: rappers } = await supabase
      .from('rappers')
      .select('id');
    
    if (!profiles || !rappers) {
      throw new Error('Failed to fetch base data');
    }
    
    const categories = ['lyrical', 'flow', 'impact', 'overall', 'style'];
    let created = 0;
    
    for (let i = 0; i < count && i < profiles.length; i++) {
      const profile = profiles[i];
      const category = categories[Math.floor(Math.random() * categories.length)];
      
      // Create user ranking
      const { data: ranking, error: rankingError } = await supabase
        .from('user_rankings')
        .insert({
          user_id: profile.id,
          title: `Top ${category.charAt(0).toUpperCase() + category.slice(1)} Rappers`,
          description: `My personal ranking of the best ${category} in hip-hop`,
          category: category,
          slug: `${category}-ranking-${profile.id}-${Date.now()}`,
          is_public: Math.random() > 0.2 // 80% public
        })
        .select()
        .single();
      
      if (rankingError) {
        console.warn(`Failed to create ranking for profile ${profile.id}:`, rankingError);
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
      
      if (!itemsError) {
        created++;
      }
    }
    
    console.log(`Successfully created ${created} user rankings`);
    return created;
    
  } catch (error) {
    console.error('Error generating test user rankings:', error);
    throw error;
  }
};
