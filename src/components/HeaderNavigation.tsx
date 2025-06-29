import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import UserProfileDropdown from './UserProfileDropdown';

interface HeaderNavigationProps {
  isScrolled: boolean;
}

const HeaderNavigation = ({ isScrolled }: HeaderNavigationProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-rap-carbon/95 backdrop-blur-sm border-b border-rap-gold/20' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-rap-gold via-rap-gold-light to-rap-gold-dark rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-rap-gold/30 transition-all">
              <span className="text-rap-carbon font-mogra font-bold text-lg">R</span>
            </div>
            <span className="text-rap-gold font-mogra text-xl font-bold group-hover:text-rap-gold-light transition-colors">
              RapRankings
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className="text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
            >
              Home
            </Link>
            <Link 
              to="/rankings" 
              className="text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
            >
              Rankings
            </Link>
            <Link 
              to="/all-rappers" 
              className="text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
            >
              All Rappers
            </Link>
            <Link 
              to="/blog" 
              className="text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className="text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
            >
              About
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user ? (
              <UserProfileDropdown />
            ) : (
              <Link 
                to="/auth" 
                className="bg-rap-gold hover:bg-rap-gold-light text-rap-carbon px-4 py-2 rounded-lg font-kaushan font-medium transition-colors"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-rap-platinum hover:text-rap-gold transition-colors"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-rap-gold/20 bg-rap-carbon/95 backdrop-blur-sm">
            <nav className="py-4 space-y-3">
              <Link 
                to="/" 
                className="block px-4 py-2 text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/rankings" 
                className="block px-4 py-2 text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Rankings
              </Link>
              <Link 
                to="/all-rappers" 
                className="block px-4 py-2 text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                All Rappers
              </Link>
              <Link 
                to="/blog" 
                className="block px-4 py-2 text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Blog
              </Link>
              <Link 
                to="/about" 
                className="block px-4 py-2 text-rap-platinum hover:text-rap-gold transition-colors font-kaushan font-medium"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderNavigation;
