
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { ThemedTabs, ThemedTabsContent, ThemedTabsList, ThemedTabsTrigger } from "@/components/ui/themed-tabs";
import { ThemedSelect, ThemedSelectContent, ThemedSelectItem, ThemedSelectTrigger, ThemedSelectValue } from "@/components/ui/themed-select";
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
      <div className="min-h-screen bg-[hsl(var(--theme-background))] flex items-center justify-center">
        <div className="text-[hsl(var(--theme-primary))] text-xl font-[var(--theme-font-heading)] animate-pulse">Loading...</div>
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
    <div className="min-h-screen bg-[hsl(var(--theme-background))]">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-7xl mx-auto p-4 sm:p-6 pt-40">
        <h1 className="text-2xl sm:text-4xl font-bold text-[hsl(var(--theme-primary))] mb-6 sm:mb-8 font-[var(--theme-font-heading)]">
          Admin Dashboard
        </h1>

        {/* Mobile/Tablet Dropdown Navigation */}
        <div className="lg:hidden mb-6">
          <ThemedSelect value={activeTab} onValueChange={setActiveTab}>
            <ThemedSelectTrigger className="w-full">
              <ThemedSelectValue />
            </ThemedSelectTrigger>
            <ThemedSelectContent>
              {tabOptions.map((option) => (
                <ThemedSelectItem 
                  key={option.value} 
                  value={option.value}
                >
                  {option.label}
                </ThemedSelectItem>
              ))}
            </ThemedSelectContent>
          </ThemedSelect>
        </div>

        {/* Desktop Tabs Navigation */}
        <ThemedTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <ThemedTabsList className="hidden lg:grid w-full grid-cols-9 gap-1 h-auto p-2">
            {tabOptions.map((option) => (
              <ThemedTabsTrigger 
                key={option.value}
                value={option.value} 
                className="text-xs xl:text-sm py-3 font-bold"
              >
                {option.label}
              </ThemedTabsTrigger>
            ))}
          </ThemedTabsList>

        {/* Tab Content */}
        <div className="bg-[hsl(var(--theme-surface))] p-3 sm:p-6 rounded-lg border border-[hsl(var(--theme-primary))] shadow-lg">
          {renderTabContent()}
        </div>
        </ThemedTabs>
      </main>
    </div>
  );
};

export default Admin;
