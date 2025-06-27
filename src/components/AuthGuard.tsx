
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ErrorBoundary from './ErrorBoundary';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AuthGuard = ({ children, requireAuth = false, adminOnly = false }: AuthGuardProps) => {
  const { user, loading, isAuthenticated } = useSecureAuth();
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
    enabled: !!user?.id && adminOnly,
    staleTime: 5 * 60 * 1000, // Cache role data for 5 minutes
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin');

  useEffect(() => {
    if (!loading && !rolesLoading && !redirecting) {
      if (requireAuth && !isAuthenticated) {
        setRedirecting(true);
        window.location.href = '/auth';
        return;
      }
      
      if (adminOnly && isAuthenticated && !isAdmin) {
        setRedirecting(true);
        window.location.href = '/';
        return;
      }
    }
  }, [user, loading, requireAuth, adminOnly, isAdmin, rolesLoading, redirecting, isAuthenticated]);

  if (loading || (adminOnly && rolesLoading) || redirecting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl font-mogra animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show content to guests unless auth is required
  if (!requireAuth || isAuthenticated) {
    // If admin is required, check admin status
    if (adminOnly && (!isAuthenticated || !isAdmin)) {
      return null; // This shouldn't be reached due to the redirect, but just in case
    }
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  // This shouldn't be reached due to the redirect, but just in case
  return null;
};

export default AuthGuard;
