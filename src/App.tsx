
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SecureAuthProvider } from "@/hooks/useSecureAuth";
import { SecurityProvider } from "@/hooks/useSecurityContext";
import { AchievementProvider } from "@/components/achievements/AchievementProvider";
import AuthGuard from "@/components/AuthGuard";
import ContentSecurityPolicy from "@/components/security/ContentSecurityPolicy";
import BackToTopButton from "@/components/BackToTopButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Analytics from "./pages/Analytics";
import AllRappers from "./pages/AllRappers";
import RapperDetail from "./pages/RapperDetail";
import Rankings from "./pages/Rankings";
import OfficialRankingDetail from "./pages/OfficialRankingDetail";
import UserRankingDetail from "./pages/UserRankingDetail";
import PublicUserProfile from "./pages/PublicUserProfile";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        // Don't retry on authentication errors
        if (error?.message?.includes('auth') || error?.status === 401) {
          return false;
        }
        // Don't retry on rate limit errors
        if (error?.message?.includes('rate limit') || error?.status === 429) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error: any) => {
        // Don't retry mutations on authentication or validation errors
        if (error?.message?.includes('auth') || 
            error?.message?.includes('Invalid') ||
            error?.status === 401 || 
            error?.status === 400) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SecureAuthProvider>
        <SecurityProvider>
          <TooltipProvider>
            <AchievementProvider>
              <Sonner />
              <ContentSecurityPolicy />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsOfUse />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogDetail />} />
                  <Route path="/rappers" element={<AllRappers />} />
                  <Route path="/all-rappers" element={<AllRappers />} />
                  <Route path="/rapper/:id" element={<RapperDetail />} />
                  <Route path="/rankings" element={<Rankings />} />
                  <Route path="/rankings/official/:slug" element={<OfficialRankingDetail />} />
                  <Route path="/rankings/user/:id" element={<UserRankingDetail />} />
                  <Route path="/user/:username" element={<PublicUserProfile />} />
                  
                  {/* Protected Routes */}
                  <Route 
                    path="/profile" 
                    element={
                      <AuthGuard requireAuth>
                        <UserProfile />
                      </AuthGuard>
                    } 
                  />
                  <Route 
                    path="/analytics" 
                    element={
                      <AuthGuard requireAuth>
                        <Analytics />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Admin Routes */}
                  <Route 
                    path="/admin" 
                    element={
                      <AuthGuard requireAuth adminOnly>
                        <Admin />
                      </AuthGuard>
                    } 
                  />
                  
                  {/* Catch all route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <BackToTopButton />
              </BrowserRouter>
            </AchievementProvider>
          </TooltipProvider>
        </SecurityProvider>
      </SecureAuthProvider>
    </QueryClientProvider>
  );
}

export default App;
