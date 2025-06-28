
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import HeaderNavigation from "@/components/HeaderNavigation";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";
import AdminRankingsManagement from "@/components/admin/AdminRankingsManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import ThemeManagement from "@/components/admin/ThemeManagement";
import SectionHeaderManagement from "@/components/admin/SectionHeaderManagement";
import RapperImageManagement from "@/components/admin/RapperImageManagement";
import AdManagement from "@/components/admin/AdManagement";
import PlaceholderImageUpload from "@/components/admin/PlaceholderImageUpload";

const Admin = () => {
  const { user } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Check if user is admin (you'll need to implement proper admin check)
  const isAdmin = true; // Replace with actual admin check

  if (!user || !isAdmin) {
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
          <TabsList className="grid w-full grid-cols-8 bg-rap-carbon-light/50">
            <TabsTrigger value="rappers">Rappers</TabsTrigger>
            <TabsTrigger value="rankings">Rankings</TabsTrigger>
            <TabsTrigger value="blog">Blog</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="placeholder">Placeholder</TabsTrigger>
            <TabsTrigger value="headers">Headers</TabsTrigger>
            <TabsTrigger value="theme">Theme</TabsTrigger>
            <TabsTrigger value="ads">Ads</TabsTrigger>
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

          <TabsContent value="images">
            <RapperImageManagement />
          </TabsContent>

          <TabsContent value="placeholder">
            <PlaceholderImageUpload />
          </TabsContent>

          <TabsContent value="headers">
            <SectionHeaderManagement />
          </TabsContent>

          <TabsContent value="theme">
            <ThemeManagement />
          </TabsContent>

          <TabsContent value="ads">
            <AdManagement />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
