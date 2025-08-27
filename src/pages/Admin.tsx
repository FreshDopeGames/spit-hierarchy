
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

  return (
    <div className="min-h-screen bg-[var(--theme-background)]">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-7xl mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold text-[var(--theme-primary)] mb-8 font-[var(--theme-font-heading)]">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="rappers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-9 bg-[var(--theme-surface)] gap-1 h-auto p-2">
            <TabsTrigger value="rappers" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Rappers</TabsTrigger>
            <TabsTrigger value="rankings" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Rankings</TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Blog</TabsTrigger>
            <TabsTrigger value="polls" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Polls</TabsTrigger>
            <TabsTrigger value="vs-matches" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">VS Matches</TabsTrigger>
            <TabsTrigger value="achievements" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Achievements</TabsTrigger>
            <TabsTrigger value="headers" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Headers</TabsTrigger>
            <TabsTrigger value="theme" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Theme</TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm py-3 font-bold text-[var(--theme-primary)]">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="rappers" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
            <AdminRapperManagement />
          </TabsContent>

          <TabsContent value="rankings" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
            <AdminRankingsManagement />
          </TabsContent>

        <TabsContent value="blog" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
          <BlogManagement />
        </TabsContent>

        <TabsContent value="polls" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
          <PollManagement />
        </TabsContent>

        <TabsContent value="vs-matches" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
          <AdminVSMatchManagement />
        </TabsContent>

        <TabsContent value="achievements" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
          <AdminAchievementManagement />
        </TabsContent>

        <TabsContent value="headers" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
          <SectionHeaderManagement />
        </TabsContent>

          <TabsContent value="theme" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
            <ThemeManagement />
          </TabsContent>

          <TabsContent value="data" className="bg-[var(--theme-background)] p-6 rounded-lg border border-[var(--theme-border)]">
            <AdminDataManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
