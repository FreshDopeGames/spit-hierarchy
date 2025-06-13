
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Rankings from "./pages/Rankings";
import OfficialRankings from "./pages/OfficialRankings";
import OfficialRankingDetail from "./pages/OfficialRankingDetail";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import RapperDetail from "./pages/RapperDetail";
import BlogDetail from "./pages/BlogDetail";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import AllRappers from "./pages/AllRappers";
import TermsOfUse from "./pages/TermsOfUse";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Footer from "./components/Footer";
import AuthGuard from "./components/AuthGuard";
import { AuthProvider } from "./hooks/useAuth";
import { AchievementProvider } from "./components/achievements/AchievementProvider";

function App() {
  return (
    <AuthProvider>
      <AchievementProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/about" element={<About />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/official-rankings" element={<OfficialRankings />} />
                <Route path="/rankings/official/:slug" element={<OfficialRankingDetail />} />
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
                <Route path="/all-rappers" element={<AllRappers />} />
                <Route path="/terms" element={<TermsOfUse />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
      </AchievementProvider>
    </AuthProvider>
  );
}

export default App;
