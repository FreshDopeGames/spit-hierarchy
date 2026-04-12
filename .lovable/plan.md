

## Problem: React Error #310 (Hooks called conditionally)

React error #310 means "Rendered fewer hooks than expected." The root cause is on **line 26-28** of `Analytics.tsx`: there is an early `return` **before** `useSearchParams`, `useState`, and `useEffect` are called. When `user` is null (e.g., during auth loading on refresh), those hooks are skipped. When `user` then becomes defined on the next render, React sees more hooks than last time and crashes.

## Fix

Move all hooks (`useSearchParams`, `useState`, `useEffect`) above the early return. The conditional guest view check stays, but happens after all hooks have been called.

### File: `src/pages/Analytics.tsx`

Reorder so all hooks are at the top of the component:

```tsx
const Analytics = () => {
  const { user } = useAuth();
  usePageVisitTracking('analytics_visits');
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'rapper-stats');

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['rapper-stats', 'platform', 'members', 'achievements', 'stats'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  // Early return AFTER all hooks
  if (!user) {
    return <GuestAnalyticsView />;
  }

  return (
    // ... rest unchanged
  );
};
```

One file changed, ~5 lines moved. No other changes needed.

