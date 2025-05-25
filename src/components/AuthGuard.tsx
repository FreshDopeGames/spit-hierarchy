
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const AuthGuard = ({ children, requireAuth = false }: AuthGuardProps) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      window.location.href = '/auth';
    }
  }, [user, loading, requireAuth]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
