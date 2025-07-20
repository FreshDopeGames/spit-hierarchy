
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useSecurityContext } from "@/hooks/useSecurityContext";
import { useSecureAuth } from "@/hooks/useSecureAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderNavigation from "@/components/HeaderNavigation";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";
import AdminRankingsManagement from "@/components/admin/AdminRankingsManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import ThemeManagement from "@/components/admin/ThemeManagement";
import SectionHeaderManagement from "@/components/admin/SectionHeaderManagement";
import AdminDataManagement from "@/components/admin/AdminDataManagement";

const Admin = () => {
  const { user, isAuthenticated } = useSecureAuth();
  const { isAdmin, isLoading } = useSecurityContext();
  const [isScrolled, setIsScrolled] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-platinum text-xl font-mogra animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <main className="max-w-7xl mx-auto p-6 pt-24">
        <h1 className="text-4xl font-bold text-rap-platinum mb-8 font-ceviche">
          Admin Dashboard
        </h1>

        <Tabs defaultValue="rappers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 bg-rap-carbon-light/50 gap-1 h-auto p-2">
            <TabsTrigger value="rappers" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Rappers</TabsTrigger>
            <TabsTrigger value="rankings" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Rankings</TabsTrigger>
            <TabsTrigger value="blog" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Blog</TabsTrigger>
            <TabsTrigger value="headers" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Headers</TabsTrigger>
            <TabsTrigger value="theme" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Theme</TabsTrigger>
            <TabsTrigger value="data" className="text-xs sm:text-sm py-3 font-bold text-rap-gold">Data</TabsTrigger>
          </TabsList>

          <TabsContent value="rappers">
            <AdminRapperManagement />
          </TabsContent>

          <TabsContent value="rankings">
            <AdminRankingsManagement />
          </TabsContent>

          <TabsContent value="blog">
            <BlogManagement />
          </TabsContent>

          <TabsContent value="headers">
            <SectionHeaderManagement />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeManagement />
          </TabsContent>

          <TabsContent value="data">
            <AdminDataManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
