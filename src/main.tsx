

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EnhancedThemeProvider } from "@/hooks/useEnhancedTheme";
import { SecureAuthProvider } from "@/hooks/useSecureAuth";
import { SecurityProvider } from "@/hooks/useSecurityContext";
import { AchievementProvider } from "@/components/achievements/AchievementProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { CookieConsentProvider } from "@/contexts/CookieConsentContext";
import App from "./App.tsx";
import "./index.css";
import "./utils/performanceCleanup";
import { registerSW } from "virtual:pwa-register";

const isPreviewHost =
  typeof window !== "undefined" &&
  (window.location.hostname.includes("id-preview--") ||
    window.location.hostname.includes("lovableproject.com"));

const isInIframe = (() => {
  if (typeof window === "undefined") return false;

  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

// Auto-activate new service workers and reload once so users always see the latest deploy
if (typeof window !== "undefined") {
  if (isPreviewHost || isInIframe) {
    window.navigator.serviceWorker?.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister().catch(() => {});
      });
    });
  } else {
    // Defer auto-reload while the user is reading a blog article so their
    // scroll position and reading flow are never interrupted by SW updates.
    const isOnBlogArticle = () => {
      const path = window.location.pathname;
      return path.startsWith("/blog/") && path.length > "/blog/".length;
    };

    let pendingUpdate = false;
    let updateSW: ((reloadPage?: boolean) => Promise<void>) | undefined;

    const applyUpdateIfSafe = () => {
      if (pendingUpdate && updateSW && !isOnBlogArticle()) {
        pendingUpdate = false;
        updateSW(true);
      }
    };

    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        pendingUpdate = true;
        applyUpdateIfSafe();
      },
      onOfflineReady() {
        pendingUpdate = true;
        applyUpdateIfSafe();
      },
      onRegisteredSW(_swUrl, registration) {
        if (registration) {
          setInterval(() => {
            registration.update().catch(() => {});
          }, 5 * 60 * 1000);
        }
      },
    });

    // Re-check when the user navigates away from the blog article (SPA or full nav).
    window.addEventListener("popstate", applyUpdateIfSafe);
    const origPush = history.pushState;
    const origReplace = history.replaceState;
    history.pushState = function (...args) {
      const result = origPush.apply(this, args as any);
      applyUpdateIfSafe();
      return result;
    };
    history.replaceState = function (...args) {
      const result = origReplace.apply(this, args as any);
      applyUpdateIfSafe();
      return result;
    };
  }
}

// Optimized QueryClient configuration with better performance settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000, // 2 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes (renamed from cacheTime)
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 3;
      },
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <EnhancedThemeProvider>
          <SecureAuthProvider>
            <SecurityProvider>
              <CookieConsentProvider>
                <TooltipProvider>
                  <AchievementProvider>
                    <ErrorBoundary>
                      <App />
                      <Toaster />
                    </ErrorBoundary>
                  </AchievementProvider>
                </TooltipProvider>
              </CookieConsentProvider>
            </SecurityProvider>
          </SecureAuthProvider>
        </EnhancedThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
