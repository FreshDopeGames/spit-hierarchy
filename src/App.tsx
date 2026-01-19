import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import AppInitializer from "@/components/AppInitializer";
import EmailConfirmationHandler from "@/components/auth/EmailConfirmationHandler";
import ScrollToTop from "@/components/ScrollToTop";
import { useUTMCapture } from "@/hooks/useUTMCapture";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import UserProfile from "./pages/UserProfile";
import Analytics from "./pages/Analytics";
import AllRappersPage from "./pages/AllRappersPage";
import RapperDetail from "./pages/RapperDetail";
import AlbumDetail from "./pages/AlbumDetail";
import Rankings from "./pages/Rankings";
import OfficialRankingDetail from "./pages/OfficialRankingDetail";
import UserRankingDetail from "./pages/UserRankingDetail";
import UserRankingRedirect from "@/components/UserRankingRedirect";
import PublicUserProfile from "./pages/PublicUserProfile";
import PublicUserProfileByUsername from "./pages/PublicUserProfileByUsername";
import About from "./pages/About";
import Blog from "./pages/Blog";
import BlogDetail from "./pages/BlogDetail";
import CommunityCypher from "./pages/CommunityCypher";
import VSMatches from "./pages/VSMatches";
import VSMatchDetail from "./pages/VSMatchDetail";
import Admin from "./pages/Admin";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import CookiePolicy from "./pages/CookiePolicy";
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";
import Notifications from "./pages/Notifications";
import Quiz from "./pages/Quiz";
import Contact from "./pages/Contact";
import { CookieConsentBanner } from "@/components/CookieConsentBanner";
import { CookieSettingsLink } from "@/components/CookieSettingsLink";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

// Component to capture UTM params and track sessions
const AppHooksWrapper = ({ children }: { children: React.ReactNode }) => {
  useUTMCapture();
  useSessionTracking();
  return <>{children}</>;
};

function App() {
  return (
    <AppInitializer>
      <BrowserRouter>
        <AppHooksWrapper>
          <ScrollToTop />
          <EmailConfirmationHandler />
          <CookieConsentBanner />
          <CookieSettingsLink />
          <InstallPrompt />
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
        </AppHooksWrapper>
      </BrowserRouter>
    </AppInitializer>
  );
}

export default App;
