
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useSecurityContext } from '@/hooks/useSecurityContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useSidebar } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderNavigationProps {
  isScrolled: boolean;
}

const HeaderNavigation = ({ isScrolled }: HeaderNavigationProps) => {
  const { user } = useAuth();
  const { isAdmin, canManageBlog, isLoading } = useSecurityContext();
  const { userProfile } = useUserProfile();
  const { toggleSidebar } = useSidebar();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-rap-carbon/95 backdrop-blur-sm border-b border-rap-gold/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Hamburger Menu */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="text-rap-platinum hover:text-rap-gold hover:bg-rap-gold/10 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="sr-only">Toggle navigation menu</span>
          </Button>

          {/* Center: Spit Hierarchy Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-rap-gold via-rap-gold-light to-rap-gold-dark rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-rap-gold/30 transition-all">
              <span className="text-rap-carbon font-mogra font-bold text-lg">S</span>
            </div>
            <span className="text-rap-gold font-mogra text-xl font-bold group-hover:text-rap-gold-light transition-colors">
              Spit Hierarchy
            </span>
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
