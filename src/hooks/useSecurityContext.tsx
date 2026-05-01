
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSecureAuth } from './useSecureAuth';
import { supabase } from '@/integrations/supabase/client';

interface SecurityContextType {
  isAdmin: boolean;
  isModerator: boolean;
  isStaffWriter: boolean;
  canManageBlog: boolean;
  isLoading: boolean;
  checkRateLimit: (actionType: string, maxRequests?: number, windowSeconds?: number) => Promise<boolean>;
}

const SecurityContext = createContext<SecurityContextType>({
  isAdmin: false,
  isModerator: false,
  isStaffWriter: false,
  canManageBlog: false,
  isLoading: true,
  checkRateLimit: async () => false,
});

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within a SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { user, isAuthenticated, loading: authLoading } = useSecureAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isModerator, setIsModerator] = useState(false);
  const [isStaffWriter, setIsStaffWriter] = useState(false);
  const [canManageBlog, setCanManageBlog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkPermissions = async () => {
      // Keep isLoading true while auth itself is still resolving so consumers
      // (e.g. blog draft visibility) don't briefly assume "no permissions".
      if (authLoading) {
        setIsLoading(true);
        return;
      }

      setIsLoading(true);
      if (!isAuthenticated || !user) {
        setIsAdmin(false);
        setIsModerator(false);
        setIsStaffWriter(false);
        setCanManageBlog(false);
        setIsLoading(false);
        return;
      }

      // Run all RPC checks in parallel so one failure doesn't wipe others
      const [adminResult, moderatorResult, blogResult] = await Promise.allSettled([
        supabase.rpc('is_admin'),
        supabase.rpc('is_moderator_or_admin'),
        supabase.rpc('can_manage_blog_content'),
      ]);

      const adminCheck = adminResult.status === 'fulfilled' ? (adminResult.value.data || false) : false;
      const moderatorCheck = moderatorResult.status === 'fulfilled' ? (moderatorResult.value.data || false) : false;
      const blogCheck = blogResult.status === 'fulfilled' ? (blogResult.value.data || false) : false;

      if (adminResult.status === 'rejected') console.error('Admin check failed:', adminResult.reason);
      if (moderatorResult.status === 'rejected') console.error('Moderator check failed:', moderatorResult.reason);
      if (blogResult.status === 'rejected') console.error('Blog check failed:', blogResult.reason);

      setIsAdmin(adminCheck);
      setIsModerator(moderatorCheck);
      setCanManageBlog(blogCheck);
      setIsStaffWriter(blogCheck && !adminCheck);
      setIsLoading(false);
    };

    checkPermissions();
  }, [user, isAuthenticated]);

  const checkRateLimit = async (
    actionType: string, 
    maxRequests: number = 10, 
    windowSeconds: number = 3600
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      const { data, error } = await supabase.rpc('check_rate_limit', {
        action_type: actionType,
        max_requests: maxRequests,
        window_seconds: windowSeconds
      });

      if (error) {
        console.error('Rate limit check error:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Rate limit check failed:', error);
      return false;
    }
  };

  return (
    <SecurityContext.Provider
      value={{
        isAdmin,
        isModerator,
        isStaffWriter,
        canManageBlog,
        isLoading,
        checkRateLimit,
      }}
    >
      {children}
    </SecurityContext.Provider>
  );
};
