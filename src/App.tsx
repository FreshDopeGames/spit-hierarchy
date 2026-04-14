import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import ScrollToTop from "@/components/ScrollToTop";
import { OnboardingProvider } from "@/components/onboarding/OnboardingProvider";
import { useUTMCapture } from "@/hooks/useUTMCapture";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import Index from "./pages/Index";

// Lazy-loaded pages
const Auth = lazy(() => import("./pages/Auth"));
const UserProfile = lazy(() => import("./pages/UserProfile"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AllRappersPage = lazy(() => import("./pages/AllRappersPage"));
const RapperDetail = lazy(() => import("./pages/RapperDetail"));
const AlbumDetail = lazy(() => import("./pages/AlbumDetail"));
const Rankings = lazy(() => import("./pages/Rankings"));
const OfficialRankingDetail = lazy(() => import("./pages/OfficialRankingDetail"));
const UserRankingDetail = lazy(() => import("./pages/UserRankingDetail"));
const UserRankingRedirect = lazy(() => import("@/components/UserRankingRedirect"));
const PublicUserProfile = lazy(() => import("./pages/PublicUserProfile"));
const PublicUserProfileByUsername = lazy(() => import("./pages/PublicUserProfileByUsername"));
const About = lazy(() => import("./pages/About"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogDetail = lazy(() => import("./pages/BlogDetail"));
const CommunityCypher = lazy(() => import("./pages/CommunityCypher"));
const VSMatches = lazy(() => import("./pages/VSMatches"));
const VSMatchDetail = lazy(() => import("./pages/VSMatchDetail"));
const Admin = lazy(() => import("./pages/Admin"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CookiePolicy = lazy(() => import("./pages/CookiePolicy"));
const TermsOfUse = lazy(() => import("./pages/TermsOfUse"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Quiz = lazy(() => import("./pages/Quiz"));
const Contact = lazy(() => import("./pages/Contact"));
const JournalEntryDetail = lazy(() => import("./pages/JournalEntryDetail"));

// Lazy-loaded deferred components (only needed for authenticated users)
const DeferredAuthComponents = lazy(() => import("@/components/DeferredAuthComponents"));
const EmailConfirmationHandler = lazy(() => import("@/components/auth/EmailConfirmationHandler"));

// Minimal loading fallback
const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

// Component to capture UTM params and track sessions
const AppHooksWrapper = ({ children }: { children: React.ReactNode }) => {
  useUTMCapture();
  useSessionTracking();
  return <>{children}</>;
};

function App() {
  const { user } = useSecureAuth();

  return (
    <BrowserRouter>
      <OnboardingProvider>
        <AppHooksWrapper>
          <ScrollToTop />
          <Suspense fallback={null}>
            <EmailConfirmationHandler />
          </Suspense>
          <CookieConsentBanner />
          <CookieSettingsLink />
          <InstallPrompt />

          {/* Only mount auth-dependent components when user is logged in */}
          {user && (
            <Suspense fallback={null}>
              <DeferredAuthComponents />
            </Suspense>
          )}

          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/cookies" element={<CookiePolicy />} />
              <Route path="/terms" element={<TermsOfUse />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogDetail />} />
              <Route path="/journal/:username/:slug" element={<JournalEntryDetail />} />
              <Route path="/rappers" element={<AllRappersPage />} />
              <Route path="/all-rappers" element={<AllRappersPage />} />
              <Route path="/rapper/:id" element={<RapperDetail />} />
              <Route path="/rapper/:rapperSlug/:albumSlug" element={<AlbumDetail />} />
              <Route path="/rankings" element={<Rankings />} />
              <Route path="/rankings/official/:slug" element={<OfficialRankingDetail />} />
              <Route path="/rankings/community-rankings/:slug" element={<UserRankingRedirect />} />
              <Route path="/vs" element={<VSMatches />} />
              <Route path="/vs/:slug" element={<VSMatchDetail />} />
              <Route path="/user/:username" element={<PublicUserProfileByUsername />} />
              <Route path="/community-cypher" element={<CommunityCypher />} />
              <Route 
                path="/quiz" 
                element={
                  <AuthGuard requireAuth>
                    <Quiz />
                  </AuthGuard>
                } 
              />
              
              {/* Protected Routes */}
              <Route 
                path="/profile" 
                element={
                  <AuthGuard requireAuth>
                    <UserProfile />
                  </AuthGuard>
                } 
              />
              <Route path="/analytics" element={<Analytics />} />
              <Route 
                path="/notifications" 
                element={
                  <AuthGuard requireAuth>
                    <Notifications />
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
          </Suspense>
        </AppHooksWrapper>
      </OnboardingProvider>
    </BrowserRouter>
  );
}

export default App;
