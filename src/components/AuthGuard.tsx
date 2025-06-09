
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AuthGuard = ({ children, requireAuth = false, adminOnly = false }: AuthGuardProps) => {
  const { user, loading } = useAuth();
  const [redirecting, setRedirecting] = useState(false);

  // Check if user has admin role when adminOnly is true
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
    enabled: !!user?.id && adminOnly
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin');

  useEffect(() => {
    if (!loading && !rolesLoading && !redirecting) {
      if (requireAuth && !user) {
        setRedirecting(true);
        window.location.href = '/auth';
        return;
      }
      
      if (adminOnly && user && !isAdmin) {
        setRedirecting(true);
        window.location.href = '/';
        return;
      }
    }
  }, [user, loading, requireAuth, adminOnly, isAdmin, rolesLoading, redirecting]);

  if (loading || (adminOnly && rolesLoading) || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show content to guests unless auth is required
  if (!requireAuth || user) {
    // If admin is required, check admin status
    if (adminOnly && (!user || !isAdmin)) {
      return null; // This shouldn't be reached due to the redirect, but just in case
    }
    return <>{children}</>;
  }

  // This shouldn't be reached due to the redirect, but just in case
  return null;
};

export default AuthGuard;
