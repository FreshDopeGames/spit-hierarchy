
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import NotFound from "./pages/NotFound";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import AuthGuard from "./components/AuthGuard";
import ErrorBoundary from "./components/ErrorBoundary";
import ContentSecurityPolicy from "./components/security/ContentSecurityPolicy";
import PerformanceMonitor from "./components/performance/PerformanceMonitor";
import { SecureAuthProvider } from "./hooks/useSecureAuth";
import { AchievementProvider } from "./components/achievements/AchievementProvider";

// Lazy load heavy components for better performance
const Rankings = lazy(() => import("./pages/Rankings"));
const OfficialRankings = lazy(() => import("./pages/OfficialRankings"));
const OfficialRankingDetail = lazy(() => import("./pages/OfficialRankingDetail"));
const UserRankingDetail = lazy(() => import("./pages/UserRankingDetail"));
const Analytics = lazy(() => import("./pages/Analytics"));
const Admin = lazy(() => import("./pages/Admin"));
const RapperDetail = lazy(() => import("./pages/RapperDetail"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const Blog = lazy(() => import("./pages/Blog"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const PublicUserProfile = lazy(() => import("./pages/PublicUserProfile"));
const AllRappers = lazy(() => import("./pages/AllRappers"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Loading component for suspense fallbacks
const PageLoader = () => (
  <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
    <div className="text-rap-gold text-xl font-mogra animate-pulse">Loading...</div>
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <ContentSecurityPolicy />
      <PerformanceMonitor />
      <SecureAuthProvider>
        <AchievementProvider>
          <Router>
            <ScrollToTop />
            <div className="min-h-screen flex flex-col">
              <main className="flex-1">
                <Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/about" element={<About />} />
                    <Route path="/rankings" element={<Rankings />} />
                    <Route path="/official-rankings" element={<OfficialRankings />} />
                    <Route path="/rankings/official/:slug" element={<OfficialRankingDetail />} />
                    <Route path="/rankings/user/:slug" element={<UserRankingDetail />} />
                    <Route path="/analytics" element={
                      <AuthGuard requireAuth={true}>
                        <Analytics />
                      </AuthGuard>
                    } />
                    <Route path="/admin" element={
                      <AuthGuard requireAuth={true} adminOnly={true}>
                        <Admin />
                      </AuthGuard>
                    } />
                    <Route path="/rapper/:id" element={<RapperDetail />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:id" element={<BlogDetail />} />
                    <Route path="/profile" element={<UserProfile />} />
                    <Route path="/user/:id" element={<PublicUserProfile />} />
                    <Route path="/all-rappers" element={<AllRappers />} />
                    <Route path="/terms" element={<TermsOfUse />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Suspense>
              </main>
              <Footer />
            </div>
            <Toaster />
          </Router>
        </AchievementProvider>
      </SecureAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
