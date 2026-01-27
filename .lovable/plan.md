

## Plan: Add "Most Achievements" Card to Community Members Analytics

### Overview

Add a fifth card titled "Most Achievements" to the Community Members analytics section (`TopMembersCards.tsx`). This card will display the top 5 members ranked by total achievements earned, using the same styling as the existing cards but with a gold medal icon.

---

### Technical Details

#### File to Modify: `src/components/analytics/TopMembersCards.tsx`

**1. Add Import for Medal Icon (line 7)**

Add `Medal` to the existing lucide-react imports:

```tsx
import { MessageCircle, Vote, Trophy, HelpCircle, Medal } from "lucide-react";
```

**2. Add New Query for Top Achievement Earners (after line 333)**

Create a new `useQuery` hook following the existing pattern:

```tsx
// Top Achievement Earners Query
const { data: topAchievers, isLoading: loadingAchievers } = useQuery({
  queryKey: ['top-achievers', timeRange],
  queryFn: async () => {
    console.log('Fetching top achievers for timeRange:', timeRange);
    
    if (timeRange === 'week') {
      // For weekly, count from user_achievements with earned_at filter
      const { data: achievements, error: achievementsError } = await supabase
        .from('user_achievements')
        .select('user_id')
        .gte('earned_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());
      
      if (achievementsError) throw achievementsError;
      if (!achievements || achievements.length === 0) return [];
      
      // Group by user and count
      const userAchievementCounts = achievements.reduce((acc: any, achievement: any) => {
        const userId = achievement.user_id;
        if (!acc[userId]) acc[userId] = { id: userId, total_achievements: 0 };
        acc[userId].total_achievements++;
        return acc;
      }, {});
      
      const memberStats = Object.values(userAchievementCounts)
        .sort((a: any, b: any) => b.total_achievements - a.total_achievements)
        .slice(0, 5);
      
      const userIds = memberStats.map((stat: any) => stat.id);
      const { data: profiles } = await supabase
        .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
      
      return memberStats.map((stat: any) => ({
        id: stat.id,
        total_achievements: stat.total_achievements,
        profiles: profiles?.find(p => p.id === stat.id) || null
      }));
    }
    
    // All-time stats - count from user_achievements table
    const { data: achievementCounts, error: achievementsError } = await supabase
      .from('user_achievements')
      .select('user_id');
    
    if (achievementsError) {
      console.error('Error fetching achievement counts:', achievementsError);
      throw achievementsError;
    }
    
    if (!achievementCounts || achievementCounts.length === 0) {
      console.log('No achievements found');
      return [];
    }
    
    // Group by user and count
    const userAchievementCounts = achievementCounts.reduce((acc: any, achievement: any) => {
      const userId = achievement.user_id;
      if (!acc[userId]) acc[userId] = { id: userId, total_achievements: 0 };
      acc[userId].total_achievements++;
      return acc;
    }, {});
    
    const memberStats = Object.values(userAchievementCounts)
      .sort((a: any, b: any) => b.total_achievements - a.total_achievements)
      .slice(0, 5);
    
    // Get user IDs
    const userIds = memberStats.map((stat: any) => stat.id);
    console.log('User IDs for achievers:', userIds);
    
    // Fetch profiles for these users using the secure batch function
    const { data: profiles, error: profilesError } = await supabase
      .rpc('get_profiles_for_analytics', { profile_user_ids: userIds });
    
    if (profilesError) {
      console.error('Error fetching profiles for achievers:', profilesError);
      throw profilesError;
    }
    
    console.log('Profiles found for achievers:', profiles);
    
    // Merge the data
    return memberStats.map((stat: any) => ({
      id: stat.id,
      total_achievements: stat.total_achievements,
      profiles: profiles?.find(p => p.id === stat.id) || null
    }));
  },
  staleTime: 30000,
  gcTime: 60000,
  refetchOnMount: true,
  refetchOnWindowFocus: true,
});
```

**3. Update Grid Layout (line 424)**

Change from 4 columns to 5 columns on large screens:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
```

**4. Add New MemberCard (after line 459, before closing `</div>`)**

Add the new card with the Medal icon (or use emoji in title):

```tsx
<MemberCard
  title="🥇 Most Achievements"
  icon={Medal}
  data={topAchievers || []}
  isLoading={loadingAchievers}
  metricKey="total_achievements"
  metricLabel="achievements"
/>
```

---

### Visual Design

| Element | Value |
|---------|-------|
| Card title | "🥇 Most Achievements" |
| Icon | `Medal` from lucide-react (as fallback in icon slot) |
| Metric label | "achievements" |
| Grid layout | 5 columns on lg+ screens (was 4) |
| Styling | Identical to existing cards (4px theme border, black bg, primary shadow) |

---

### Data Flow

```text
All Time:
user_achievements table → group by user_id → count → order desc → top 5

This Week:
user_achievements (earned_at >= 7 days ago) → group by user_id → count → order desc → top 5
```

---

### Summary

| Change | Location | Description |
|--------|----------|-------------|
| Import | Line 7 | Add `Medal` icon import |
| Query | After line 333 | New `topAchievers` useQuery with weekly/all-time support |
| Grid | Line 424 | Update to `lg:grid-cols-5` |
| Card | After line 459 | Add "🥇 Most Achievements" MemberCard |

