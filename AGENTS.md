
- On-site playback uses a single app-wide YouTube player provider and cached track→video matches in the database; why: survives page navigation and keeps YouTube API quota low.
- Performance: third-party trackers (Clarity) load on idle after window load, activity/idle hooks use passive throttled listeners and only set state on transitions, and no runtime `<link rel="preload">` injection; why: keeps INP/LCP/CLS in the "good" range on mobile.
