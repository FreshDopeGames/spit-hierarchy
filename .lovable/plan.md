

## Root Cause

The quiz answer submission in `src/hooks/useQuiz.ts` (line 145) invalidates cache key `['quiz-badges', user?.id]`, but the actual query key in `src/hooks/useQuizBadges.ts` (line 54) is `['user-quiz-badges', targetUserId]`. The keys don't match, so the earned badges query is **never refreshed** after earning new badges. The "(X earned)" count stays stale until a full page reload.

Additionally, the category stats query key `['quiz-category-stats', targetUserId]` is also never invalidated.

## Plan

### 1. Fix cache invalidation keys in `src/hooks/useQuiz.ts`

At line 145, change:
```typescript
queryClient.invalidateQueries({ queryKey: ['quiz-badges', user?.id] });
```
to:
```typescript
queryClient.invalidateQueries({ queryKey: ['user-quiz-badges', user?.id] });
queryClient.invalidateQueries({ queryKey: ['quiz-category-stats', user?.id] });
queryClient.invalidateQueries({ queryKey: ['all-quiz-badges'] });
```

This ensures:
- The earned badges list refreshes (fixes the "(X earned)" count)
- The category stats refresh (fixes progress bars)
- The full badge list refreshes (in case any badge metadata changed)

Single file change: `src/hooks/useQuiz.ts`, lines 144-145.

