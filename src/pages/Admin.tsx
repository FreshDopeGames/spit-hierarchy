
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import HeaderNavigation from "@/components/HeaderNavigation";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";
import AdminRankingsManagement from "@/components/admin/AdminRankingsManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import PollManagement from "@/components/admin/PollManagement";
import ThemeManagement from "@/components/admin/ThemeManagement";
import SectionHeaderManagement from "@/components/admin/SectionHeaderManagement";
import AdminDataManagement from "@/components/admin/AdminDataManagement";
import AdminAchievementManagement from "@/components/admin/AdminAchievementManagement";
import AdminVSMatchManagement from "@/components/admin/AdminVSMatchManagement";

const Admin = () => {
  const { user, isAuthenticated } = useSecureAuth();
  const { isAdmin, isLoading } = useSecurityContext();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeTab, setActiveTab] = useState("rappers");

  const tabOptions = [
    { value: "rappers", label: "Rappers" },
    { value: "rankings", label: "Rankings" },
    { value: "blog", label: "Blog" },
    { value: "polls", label: "Polls" },
    { value: "vs-matches", label: "VS Matches" },
    { value: "achievements", label: "Achievements" },
    { value: "headers", label: "Headers" },
    { value: "theme", label: "Theme" },
    { value: "data", label: "Data" }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[var(--theme-background)] flex items-center justify-center">
        <div className="text-[var(--theme-primary)] text-xl font-[var(--theme-font-heading)] animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "rappers":
        return <AdminRapperManagement />;
      case "rankings":
        return <AdminRankingsManagement />;
      case "blog":
        return <BlogManagement />;
      case "polls":
        return <PollManagement />;
      case "vs-matches":
        return <AdminVSMatchManagement />;
      case "achievements":
        return <AdminAchievementManagement />;
      case "headers":
        return <SectionHeaderManagement />;
      case "theme":
        return <ThemeManagement />;
      case "data":
        return <AdminDataManagement />;
      default:
        return <AdminRapperManagement />;
    }
  };

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 pt-24">
        <h1 className="text-2xl sm:text-4xl font-bold text-[var(--theme-primary)] mb-6 sm:mb-8 font-[var(--theme-font-heading)]">
          Admin Dashboard
        </h1>

        {/* Mobile/Tablet Dropdown Navigation */}
        <div className="lg:hidden mb-6">
          <Select value={activeTab} onValueChange={setActiveTab}>
            <SelectTrigger className="w-full bg-[var(--theme-surface)] border border-[var(--theme-border)] text-[var(--theme-primary)] font-medium">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[var(--theme-surface)] border border-[var(--theme-border)] z-50">
              {tabOptions.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={option.value}
                  className="text-[var(--theme-primary)] hover:bg-[var(--theme-background)] cursor-pointer"
                >
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Desktop Tabs Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="hidden lg:grid w-full grid-cols-9 bg-[var(--theme-surface)] gap-1 h-auto p-2">
            {tabOptions.map((option) => (
              <TabsTrigger 
                key={option.value}
                value={option.value} 
                className="text-xs xl:text-sm py-3 font-bold text-[var(--theme-primary)]"
              >
                {option.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Tab Content */}
          <div className="bg-[var(--theme-background)] p-3 sm:p-6 rounded-lg border border-[var(--theme-border)]">
            {renderTabContent()}
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
