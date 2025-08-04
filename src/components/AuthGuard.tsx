
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import ErrorBoundary from './ErrorBoundary';
import AuthExpired from './auth/AuthExpired';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AuthGuard = ({ children, requireAuth = false, adminOnly = false }: AuthGuardProps) => {
  const { user, loading, isAuthenticated } = useSecureAuth();
  const location = useLocation();
  const [showAuthExpired, setShowAuthExpired] = useState(false);

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
    if (!loading && !rolesLoading) {
      if (requireAuth && !isAuthenticated) {
        setShowAuthExpired(true);
        return;
      }
      
      if (adminOnly && isAuthenticated && !isAdmin) {
        // Non-admin trying to access admin route
        return;
      }
    }
  }, [user, loading, requireAuth, adminOnly, isAdmin, rolesLoading, isAuthenticated]);

  if (loading || (adminOnly && rolesLoading)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-rap-carbon via-rap-carbon-light to-rap-carbon flex items-center justify-center">
        <div className="text-rap-gold text-xl font-mogra animate-pulse">Loading...</div>
      </div>
    );
  }

  // Show auth expired page for unauthenticated users trying to access protected routes
  if (showAuthExpired || (requireAuth && !isAuthenticated)) {
    return <AuthExpired wasAdmin={adminOnly} previousRoute={location.pathname} />;
  }

  // Redirect non-admin users trying to access admin routes
  if (adminOnly && isAuthenticated && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  // Show content to guests unless auth is required
  if (!requireAuth || isAuthenticated) {
    return (
      <ErrorBoundary>
        {children}
      </ErrorBoundary>
    );
  }

  return null;
};

export default AuthGuard;
