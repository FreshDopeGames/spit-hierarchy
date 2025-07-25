
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfileDropdown from './UserProfileDropdown';
import NavigationSidebar from './NavigationSidebar';
import { AvatarSkeleton, TextSkeleton } from '@/components/ui/skeleton';

interface HeaderNavigationProps {
  isScrolled: boolean;
}

const HeaderNavigation = ({
  isScrolled
}: HeaderNavigationProps) => {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, canManageBlog, isLoading: securityLoading } = useSecurityContext();
  const { userProfile, loading: profileLoading } = useUserProfile();

  // Combined loading state - show skeleton until all data is loaded
  const isLoading = authLoading || (user && profileLoading) || securityLoading;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-[var(--theme-primary)] transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Menu using NavigationSidebar */}
          <NavigationSidebar />

          {/* Center: Logo Only */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Logo" 
              className="h-10 sm:h-12 w-auto" 
            />
          </Link>

          {/* Right: User Menu */}
          <div className="flex items-center">
            {isLoading ? (
              <div className="flex items-center space-x-3">
                <AvatarSkeleton size={isScrolled ? 'sm' : 'md'} />
                <TextSkeleton width="w-16" height="h-4" />
              </div>
            ) : user ? (
              <UserProfileDropdown 
                userProfile={userProfile} 
                isAdmin={isAdmin} 
                canManageBlog={canManageBlog} 
                isScrolled={isScrolled} 
              />
            ) : (
              <Link 
                to="/auth" 
                className="bg-[var(--theme-primary)] hover:bg-[var(--theme-primary-light)] text-[var(--theme-background)] px-4 py-2 rounded-lg font-[var(--theme-font-body)] font-medium transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
