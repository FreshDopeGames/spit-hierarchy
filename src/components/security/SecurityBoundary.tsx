
import { ReactNode } from 'react';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield } from 'lucide-react';

interface SecurityBoundaryProps {
  children: ReactNode;
  requireAdmin?: boolean;
  requireModerator?: boolean;
  requireBlogEditor?: boolean;
  fallback?: ReactNode;
}

const SecurityBoundary = ({
  children,
  requireAdmin = false,
  requireModerator = false,
  requireBlogEditor = false,
  fallback
}: SecurityBoundaryProps) => {
  const { isAdmin, isModerator, canManageBlog, isLoading } = useSecurityContext();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rap-gold"></div>
      </div>
    );
  }

  const hasPermission = 
    (!requireAdmin || isAdmin) &&
    (!requireModerator || isModerator) &&
    (!requireBlogEditor || canManageBlog);

  if (!hasPermission) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <Alert className="border-red-500 bg-red-50">
        <Shield className="h-4 w-4 text-red-500" />
        <AlertDescription className="text-red-700">
          You don't have permission to access this content.
        </AlertDescription>
      </Alert>
    );
  }

  return <>{children}</>;
};

export default SecurityBoundary;
