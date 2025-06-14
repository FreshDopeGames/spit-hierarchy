import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import ThemeManagement from "@/components/admin/ThemeManagement";
import RapperImageManagement from "@/components/admin/RapperImageManagement";
import AdminRankingsManagement from "@/components/admin/AdminRankingsManagement";
import AdManagement from "@/components/admin/AdManagement";
import InternalPageHeader from "@/components/InternalPageHeader";
import { Navigate } from "react-router-dom";
import SectionHeaderManagement from "@/components/admin/SectionHeaderManagement";

const Admin = () => {
  const { user, loading } = useAuth();

  // Check if user has admin role
  const { data: userRoles, isLoading: rolesLoading, error: rolesError } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      console.log('Checking roles for user ID:', user.id);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      console.log('User roles query result:', { data, error });
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  console.log('Current user:', user);
  console.log('User roles:', userRoles);
  console.log('Roles loading:', rolesLoading);
  console.log('Roles error:', rolesError);

  const isAdmin = userRoles?.some(role => role.role === 'admin');
  const canManageBlog = userRoles?.some(role => role.role === 'admin' || role.role === 'blog_editor');

  console.log('Is admin:', isAdmin);
  console.log('Can manage blog:', canManageBlog);

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
        <InternalPageHeader />
        <div className="pt-20 sm:pt-24 flex items-center justify-center px-3 sm:px-4">
          <div className="text-rap-platinum">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    console.log('No user found, redirecting to auth');
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin && !canManageBlog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
        <InternalPageHeader />
        <div className="pt-20 sm:pt-24 flex items-center justify-center px-3 sm:px-4">
          <Card className="bg-carbon-fiber border border-red-500/50 p-4 sm:p-8 max-w-md w-full mx-auto">
            <CardHeader>
              <CardTitle className="text-red-400 text-center text-lg sm:text-xl">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-rap-platinum text-center text-sm sm:text-base">You don't have permission to access the admin panel.</p>
              <div className="text-xs sm:text-sm text-rap-smoke space-y-2">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Roles found:</strong> {userRoles?.length ? userRoles.map(r => r.role).join(', ') : 'None'}</p>
                {rolesError && <p className="text-red-400"><strong>Error:</strong> {rolesError.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState(isAdmin ? "rappers" : "blog");

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon overflow-x-hidden">
      <InternalPageHeader />
      
      <div className="pt-20 sm:pt-24 px-3 sm:px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 sm:mb-8 text-center">
            <h1 className="font-ceviche text-rap-gold mb-2 tracking-wider text-3xl sm:text-4xl lg:text-5xl break-words">
              Admin Control Panel
            </h1>
            <p className="text-rap-platinum font-merienda text-base sm:text-lg">
              Manage the Sacred Temple of Hip-Hop
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-rap-carbon-light border border-rap-silver/30 mb-6">
              <TabsTrigger value="rappers" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Rappers
              </TabsTrigger>
              <TabsTrigger value="rankings" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Rankings
              </TabsTrigger>
              <TabsTrigger value="blog" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Blog
              </TabsTrigger>
              <TabsTrigger value="ads" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Ads
              </TabsTrigger>
              <TabsTrigger value="headers" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Headers
              </TabsTrigger>
              <TabsTrigger value="theme" className="text-rap-silver font-kaushan data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon">
                Theme
              </TabsTrigger>
            </TabsList>

            {isAdmin && (
              <TabsContent value="rappers">
                <AdminRapperManagement />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="rankings">
                <AdminRankingsManagement />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="images">
                <RapperImageManagement />
              </TabsContent>
            )}

            {canManageBlog && (
              <TabsContent value="blog">
                <BlogManagement />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="ads">
                <AdManagement />
              </TabsContent>
            )}

            {isAdmin && (
              <TabsContent value="theme">
                <ThemeManagement />
              </TabsContent>
            )}

            <TabsContent value="headers" className="space-y-6">
              <SectionHeaderManagement />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
