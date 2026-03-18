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
import AdminRapperSuggestions from "@/components/admin/AdminRapperSuggestions";
import { AnnouncementManagement } from "@/components/admin/AnnouncementManagement";
import QuizManagement from "@/components/admin/QuizManagement";
import AcquisitionAnalytics from "@/components/admin/AcquisitionAnalytics";
import BioBulkPopulation from "@/components/admin/BioBulkPopulation";
import AdminUserManagement from "@/components/admin/AdminUserManagement";

const ALL_TABS = [
{ value: "rappers", label: "Rappers", roles: ["admin"] },
{ value: "rankings", label: "Rankings", roles: ["admin", "staff_writer"] },
{ value: "blog", label: "Blog", roles: ["admin", "staff_writer"] },
{ value: "polls", label: "Polls", roles: ["admin", "staff_writer"] },
{ value: "quizzes", label: "Quizzes", roles: ["admin", "staff_writer"] },
{ value: "vs-matches", label: "VS Matches", roles: ["admin"] },
{ value: "achievements", label: "Achievements", roles: ["admin"] },
{ value: "suggestions", label: "Suggestions", roles: ["admin"] },
{ value: "headers", label: "Headers", roles: ["admin"] },
{ value: "theme", label: "Theme", roles: ["admin"] },
{ value: "data", label: "Data", roles: ["admin"] },
{ value: "announcements", label: "Announcements", roles: ["admin"] },
{ value: "acquisition", label: "Acquisition", roles: ["admin"] },
{ value: "bios", label: "Bios", roles: ["admin"] },
{ value: "users", label: "Users", roles: ["admin"] }];


const Admin = () => {
  const { isAuthenticated } = useSecureAuth();
  const { isAdmin, isModerator, isStaffWriter, canManageBlog, isLoading } = useSecurityContext();
  const [isScrolled, setIsScrolled] = useState(false);

  // Determine which tabs to show based on role
  const getUserRole = () => {
    if (isAdmin) return "admin";
    if (isStaffWriter || canManageBlog) return "staff_writer";
    if (isModerator) return "moderator";
    return null;
  };

  const userRole = getUserRole();
  const tabOptions = ALL_TABS.filter((tab) => tab.roles.includes(userRole || ""));
  const [activeTab, setActiveTab] = useState(tabOptions[0]?.value || "rappers");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--theme-background))] flex items-center justify-center">
        <div className="text-[hsl(var(--theme-primary))] text-xl font-[var(--theme-font-heading)] animate-pulse">Loading...</div>
      </div>);

  }

  // Allow admin, staff writer, or moderator
  if (!isAuthenticated || !userRole) {
    return <Navigate to="/auth" replace />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "rappers":return <AdminRapperManagement />;
      case "rankings":return <AdminRankingsManagement />;
      case "blog":return <BlogManagement />;
      case "polls":return <PollManagement />;
      case "quizzes":return <QuizManagement />;
      case "vs-matches":return <AdminVSMatchManagement />;
      case "achievements":return <AdminAchievementManagement />;
      case "suggestions":return <AdminRapperSuggestions />;
      case "headers":return <SectionHeaderManagement />;
      case "theme":return <ThemeManagement />;
      case "data":return <AdminDataManagement />;
      case "announcements":return <AnnouncementManagement />;
      case "acquisition":return <AcquisitionAnalytics />;
      case "bios":return <BioBulkPopulation />;
      case "users":return <AdminUserManagement />;
      default:return <AdminRapperManagement />;
    }
  };

  // Split tabs into rows for desktop
  const midpoint = Math.ceil(tabOptions.length / 2);
  const row1 = tabOptions.slice(0, midpoint);
  const row2 = tabOptions.slice(midpoint);

  const gridColsMap: Record<number, string> = {
    1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4",
    5: "grid-cols-5", 6: "grid-cols-6", 7: "grid-cols-7", 8: "grid-cols-8",
    9: "grid-cols-9", 10: "grid-cols-10",
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--theme-background))]">
      <HeaderNavigation isScrolled={isScrolled} />

      <main className="max-w-7xl mx-auto px-4 pb-4 sm:px-6 sm:pb-6 pt-20 sm:pt-40 py-[80px]">
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
              {tabOptions.map((option) =>
              <ThemedSelectItem key={option.value} value={option.value}>
                  {option.label}
                </ThemedSelectItem>
              )}
            </ThemedSelectContent>
          </ThemedSelect>
        </div>

        {/* Desktop Tabs Navigation */}
        <ThemedTabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="hidden lg:flex flex-col gap-2">
            <ThemedTabsList className={`w-full grid grid-cols-${row1.length} gap-1 h-auto p-2`}>
              {row1.map((option) =>
              <ThemedTabsTrigger key={option.value} value={option.value} className="text-xs xl:text-sm py-3 font-bold">
                  {option.label}
                </ThemedTabsTrigger>
              )}
            </ThemedTabsList>
            {row2.length > 0 &&
            <ThemedTabsList className={`w-full grid grid-cols-${row2.length} gap-1 h-auto p-2`}>
                {row2.map((option) =>
              <ThemedTabsTrigger key={option.value} value={option.value} className="text-xs xl:text-sm py-3 font-bold">
                    {option.label}
                  </ThemedTabsTrigger>
              )}
              </ThemedTabsList>
            }
          </div>

          <div className="bg-[hsl(var(--theme-surface))] p-3 sm:p-6 rounded-lg border-[hsl(var(--theme-primary))] shadow-lg bg-theme-black border-4">
            {renderTabContent()}
          </div>
        </ThemedTabs>
      </main>
    </div>);

};

export default Admin;