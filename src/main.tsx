
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from "@/components/ui/sonner";
import { EnhancedThemeProvider } from "@/hooks/useEnhancedTheme";
import { SecureAuthProvider } from "@/hooks/useSecureAuth";
import { SecurityProvider } from "@/hooks/useSecurityContext";
import { AchievementProvider } from "@/components/achievements/AchievementProvider";
import ContentSecurityPolicy from "@/components/security/ContentSecurityPolicy";
import PerformanceMonitor from "@/components/performance/PerformanceMonitor";
import App from "./App.tsx";
import "./index.css";
import "./utils/performanceCleanup";

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
      <ContentSecurityPolicy />
      <PerformanceMonitor />
      <QueryClientProvider client={queryClient}>
        <EnhancedThemeProvider>
          <SecureAuthProvider>
            <SecurityProvider>
              <AchievementProvider>
                <App />
                <Toaster />
              </AchievementProvider>
            </SecurityProvider>
          </SecureAuthProvider>
        </EnhancedThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </StrictMode>
);
