
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Music, LogIn, Trophy, Calendar } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import UserProfileDropdown from "./UserProfileDropdown";

interface HeaderNavigationProps {
  isScrolled: boolean;
}

const HeaderNavigation = ({ isScrolled }: HeaderNavigationProps) => {
  const { user } = useAuth();

  // Check if user has admin role
  const { data: userRoles } = useQuery({
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
    enabled: !!user?.id
  });

  // Get user profile for avatar
  const { data: userProfile } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const isAdmin = userRoles?.some(role => role.role === 'admin');
  const canManageBlog = userRoles?.some(role => role.role === 'admin' || role.role === 'blog_editor');

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/95 backdrop-blur-md border-b border-rap-gold/50 h-16' : 'bg-black border-b border-rap-gold/30 h-20'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-full">
        <div className="flex items-center justify-center flex-1">
          <Link to="/" className="flex items-center justify-center">
            <img 
              src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
              alt="Spit Hierarchy - The Ultimate Rap Rankings Platform" 
              className={`object-contain transition-all duration-300 ${isScrolled ? 'h-12' : 'h-16'}`} 
            />
          </Link>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4 absolute right-4">
          <Link to="/blog">
            <Button 
              variant="outline" 
              className={`bg-rap-charcoal border-4 border-rap-charcoal text-rap-gold hover:bg-rap-charcoal/80 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Slick Talk
            </Button>
          </Link>
          <Link to="/all-rappers">
            <Button 
              variant="outline" 
              className={`bg-rap-charcoal border-4 border-rap-charcoal text-rap-forest hover:bg-rap-charcoal/80 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}
            >
              <Music className="w-4 h-4 mr-2" />
              All Artists
            </Button>
          </Link>
          <Link to="/rankings">
            <Button 
              variant="outline" 
              className={`bg-rap-charcoal border-4 border-rap-charcoal text-rap-burgundy hover:bg-rap-charcoal/80 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}
            >
              <Trophy className="w-4 h-4 mr-2" />
              Rankings
            </Button>
          </Link>
          
          {user ? (
            <UserProfileDropdown 
              userProfile={userProfile} 
              isAdmin={isAdmin} 
              canManageBlog={canManageBlog} 
              isScrolled={isScrolled} 
            />
          ) : (
            <Link to="/auth">
              <Button className={`bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra transition-all duration-300 shadow-lg shadow-rap-gold/30 ${isScrolled ? 'text-xs px-3 py-1' : ''}`}>
                <LogIn className="w-4 h-4 mr-2" />
                Join In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
