
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthGuard from "@/components/AuthGuard";
import AppInitializer from "@/components/AppInitializer";
import EmailConfirmationHandler from "@/components/auth/EmailConfirmationHandler";
import ScrollToTop from "@/components/ScrollToTop";
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
import TermsOfUse from "./pages/TermsOfUse";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <AppInitializer>
      <BrowserRouter>
        <ScrollToTop />
        <EmailConfirmationHandler />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsOfUse />} />
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
      </BrowserRouter>
    </AppInitializer>
  );
}

export default App;
