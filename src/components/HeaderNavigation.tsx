
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
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-rap-carbon/95 backdrop-blur-md border-b border-rap-gold/50 py-2' : 'bg-carbon-fiber border-b border-rap-gold/30 py-4'}`}>
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img 
            src="/lovable-uploads/eea1a328-61f1-40e8-bdac-06d4e50baefe.png" 
            alt="Spit Hierarchy Logo" 
            className={`object-contain transition-all duration-300 ${isScrolled ? 'w-12 h-8' : 'w-16 h-12'}`} 
          />
          <div className="flex flex-col px-[40px]">
            <h1 className={`font-mogra bg-gradient-to-r from-rap-gold via-rap-gold-light to-rap-gold bg-clip-text text-transparent transition-all duration-300 ${isScrolled ? 'text-lg' : 'text-2xl'}`}>
              Spit Hierarchy
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <Link to="/blog">
            <Button variant="outline" className={`border-rap-gold/50 text-rap-gold hover:bg-rap-gold/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
              <Calendar className="w-4 h-4 mr-2" />
              Sacred Scrolls
            </Button>
          </Link>
          <Link to="/all-rappers">
            <Button variant="outline" className={`border-rap-forest/50 text-rap-forest hover:bg-rap-forest/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
              <Music className="w-4 h-4 mr-2" />
              All Artists
            </Button>
          </Link>
          <Link to="/rankings">
            <Button variant="outline" className={`border-rap-burgundy/50 text-rap-burgundy hover:bg-rap-burgundy/20 font-kaushan transition-all duration-300 ${isScrolled ? 'text-xs px-2 py-1' : ''}`}>
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
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button className={`bg-gradient-to-r from-rap-burgundy via-rap-gold to-rap-forest hover:from-rap-burgundy-light hover:via-rap-gold-light hover:to-rap-forest-light font-mogra transition-all duration-300 shadow-lg shadow-rap-gold/30 ${isScrolled ? 'text-xs px-3 py-1' : ''}`}>
                  <LogIn className="w-4 h-4 mr-2" />
                  Join In
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderNavigation;
