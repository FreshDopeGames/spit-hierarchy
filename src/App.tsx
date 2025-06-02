
import { Toaster } from "@/components/ui/toaster";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Rankings from "./pages/Rankings";
import OfficialRankings from "./pages/OfficialRankings";
import Analytics from "./pages/Analytics";
import Admin from "./pages/Admin";
import RapperDetail from "./pages/RapperDetail";
import BlogDetail from "./pages/BlogDetail";
import Blog from "./pages/Blog";
import NotFound from "./pages/NotFound";
import UserProfile from "./pages/UserProfile";
import AllRappers from "./pages/AllRappers";
import { AuthProvider } from "./hooks/useAuth";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/rankings" element={<Rankings />} />
            <Route path="/official-rankings" element={<OfficialRankings />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/rapper/:id" element={<RapperDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogDetail />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/all-rappers" element={<AllRappers />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
