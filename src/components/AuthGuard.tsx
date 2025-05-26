
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const AuthGuard = ({ children, requireAuth = false, adminOnly = false }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        window.location.href = '/auth';
      }
      // TODO: Implement admin role checking when user roles are set up
      if (adminOnly && !user) {
        window.location.href = '/auth';
      }
    }
  }, [user, loading, requireAuth, adminOnly]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Show content to guests unless auth is required
  if (!requireAuth || user) {
    return <>{children}</>;
  }

  // This shouldn't be reached due to the redirect, but just in case
  return null;
};

export default AuthGuard;
