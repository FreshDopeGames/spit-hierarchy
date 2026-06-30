import { useEffect, useState, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const TRACKED_PATHS = [
  "/",
  "/rankings",
  "/all-rappers",
  "/vs",
  "/blog",
  "/community-cypher",
  "/quiz",
  "/analytics",
  "/about",
];

const storageKey = (userId: string) => `visited_pages_${userId}`;

const readVisited = (userId: string): string[] => {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const writeVisited = (userId: string, paths: string[]) => {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(paths));
  } catch {
    /* ignore */
  }
};

const matchesTracked = (pathname: string): string | null => {
  // Exact root
  if (pathname === "/") return "/";
  // Sort by length desc so longer prefixes win
  const sorted = [...TRACKED_PATHS].filter((p) => p !== "/").sort((a, b) => b.length - a.length);
  for (const p of sorted) {
    if (pathname === p || pathname.startsWith(p + "/")) return p;
  }
  return null;
};

export const useVisitedPages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [visited, setVisited] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setVisited([]);
      return;
    }
    setVisited(readVisited(user.id));
  }, [user]);

  // Mark page visited when route changes
  useEffect(() => {
    if (!user) return;
    const matched = matchesTracked(location.pathname);
    if (!matched) return;
    setVisited((prev) => {
      if (prev.includes(matched)) return prev;
      const next = [...prev, matched];
      writeVisited(user.id, next);
      return next;
    });
  }, [location.pathname, user]);

  const isVisited = useCallback(
    (path: string) => !user || visited.includes(path),
    [visited, user]
  );

  const hasUnvisited = useCallback(
    (paths: string[]) => !!user && paths.some((p) => !visited.includes(p)),
    [visited, user]
  );

  return { isVisited, hasUnvisited, trackedPaths: TRACKED_PATHS, isLoggedIn: !!user };
};
