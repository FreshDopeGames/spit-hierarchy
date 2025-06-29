
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import UserProfileDropdown from './UserProfileDropdown';
import NavigationSidebar from './NavigationSidebar';

interface HeaderNavigationProps {
  isScrolled: boolean;
}

const HeaderNavigation = ({
  isScrolled
}: HeaderNavigationProps) => {
  const { user } = useAuth();
  const { isAdmin, canManageBlog, isLoading } = useSecurityContext();
  const { userProfile } = useUserProfile();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black border-b border-rap-gold transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Menu using NavigationSidebar */}
          <NavigationSidebar />

          {/* Center: Logo Only */}
          <Link to="/" className="flex items-center group">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Logo" 
              className="w-12 h-8" 
            />
          </Link>

          {/* Right: User Menu */}
          <div className="flex items-center">
            {user ? (
              <UserProfileDropdown 
                userProfile={userProfile} 
                isAdmin={isAdmin} 
                canManageBlog={canManageBlog} 
                isScrolled={isScrolled} 
              />
            ) : (
              <Link 
                to="/auth" 
                className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon px-4 py-2 rounded-lg font-kaushan font-medium transition-colors"
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
