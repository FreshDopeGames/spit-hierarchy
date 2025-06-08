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
import HeaderNavigation from "@/components/HeaderNavigation";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={isScrolled} />
        <div className="pt-24 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
        <HeaderNavigation isScrolled={isScrolled} />
        <div className="pt-24 flex items-center justify-center">
          <Card className="bg-carbon-fiber border border-red-500/50 p-8 max-w-md">
            <CardHeader>
              <CardTitle className="text-red-400 text-center">Access Denied</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-rap-platinum text-center">You don't have permission to access the admin panel.</p>
              <div className="text-sm text-rap-smoke space-y-2">
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <HeaderNavigation isScrolled={isScrolled} />
      
      <div className="pt-24 container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="font-ceviche text-rap-gold mb-2 tracking-wider text-5xl">
            Admin Control Panel
          </h1>
          <p className="text-rap-platinum font-merienda text-lg">
            Manage the Sacred Temple of Hip-Hop
          </p>
        </div>

        <Tabs defaultValue={isAdmin ? "rappers" : "blog"} className="space-y-6">
          <TabsList className="bg-carbon-fiber border border-rap-gold/30 p-1">
            {isAdmin && (
              <TabsTrigger value="rappers" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Rapper Management
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="rankings" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Rankings Management
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="images" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Image Management
              </TabsTrigger>
            )}
            {canManageBlog && (
              <TabsTrigger value="blog" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Blog Management
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="ads" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Ad Management
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger value="theme" className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra">
                Theme Management
              </TabsTrigger>
            )}
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
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
