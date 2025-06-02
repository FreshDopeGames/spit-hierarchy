
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AdminRapperManagement from "@/components/admin/AdminRapperManagement";
import BlogManagement from "@/components/admin/BlogManagement";
import ThemeManagement from "@/components/admin/ThemeManagement";
import { Navigate } from "react-router-dom";

const Admin = () => {
  const { user, loading } = useAuth();

  // Check if user has admin role
  const { data: userRoles, isLoading: rolesLoading } = useQuery({
    queryKey: ['user-roles', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin');
  const canManageBlog = userRoles?.some(role => role.role === 'admin' || role.role === 'blog_editor');

  if (loading || rolesLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-platinum">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin && !canManageBlog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <Card className="bg-carbon-fiber border border-red-500/50 p-8">
          <CardHeader>
            <CardTitle className="text-red-400 text-center">Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-rap-platinum text-center">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-ceviche text-rap-gold mb-2 animate-text-glow tracking-wider">
            Admin Control Panel
          </h1>
          <p className="text-rap-platinum font-kaushan text-lg">
            Manage the Sacred Temple of Hip-Hop
          </p>
        </div>

        <Tabs defaultValue={isAdmin ? "rappers" : "blog"} className="space-y-6">
          <TabsList className="bg-carbon-fiber border border-rap-gold/30 p-1">
            {isAdmin && (
              <TabsTrigger 
                value="rappers" 
                className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra"
              >
                Rapper Management
              </TabsTrigger>
            )}
            {canManageBlog && (
              <TabsTrigger 
                value="blog" 
                className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra"
              >
                Blog Management
              </TabsTrigger>
            )}
            {isAdmin && (
              <TabsTrigger 
                value="theme" 
                className="text-rap-platinum data-[state=active]:bg-rap-gold data-[state=active]:text-rap-carbon font-mogra"
              >
                Theme Management
              </TabsTrigger>
            )}
          </TabsList>

          {isAdmin && (
            <TabsContent value="rappers">
              <AdminRapperManagement />
            </TabsContent>
          )}

          {canManageBlog && (
            <TabsContent value="blog">
              <BlogManagement />
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
