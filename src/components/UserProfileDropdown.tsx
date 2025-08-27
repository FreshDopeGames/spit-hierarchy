
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface UserProfileDropdownProps {
  userProfile: any;
  isAdmin: boolean;
  canManageBlog: boolean;
  isScrolled: boolean;
}

const UserProfileDropdown = ({
  userProfile,
  isAdmin,
  canManageBlog,
  isScrolled
}: UserProfileDropdownProps) => {
  const { user, signOut } = useAuth();

  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;
    
    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;
    
    // Construct the thumb size URL for navigation
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };

  const avatarUrl = getAvatarUrl(userProfile?.avatar_url);
  const displayName = userProfile?.username || userProfile?.full_name || user?.email;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-rap-gold/50 hover:border-rap-gold`}>
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName || 'User'}
              style={{ imageRendering: 'crisp-edges' }}
              loading="eager"
            />
            <AvatarFallback className="bg-gradient-to-r from-rap-burgundy to-rap-gold text-rap-platinum">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black border-rap-gold/30 shadow-2xl shadow-rap-gold/20 border-2">
        <div className="px-3 py-2 border-b border-rap-smoke/30">
          <p className="text-rap-gold font-kaushan font-bold text-sm truncate">
            {displayName}
          </p>
        </div>
        
        <Link to="/profile">
          <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
            <User className="w-4 h-4 mr-3" />
            View Profile
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-rap-smoke/30" />
        
        <Link to="/analytics">
          <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
            <Trophy className="w-4 h-4 mr-3" />
            Analytics
          </DropdownMenuItem>
        </Link>
        
        {(isAdmin || canManageBlog) && (
          <>
            <DropdownMenuSeparator className="bg-rap-smoke/30" />
            <Link to="/admin">
              <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-rap-smoke/30" />
        
        <DropdownMenuItem onClick={signOut} className="text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-burgundy font-kaushan cursor-pointer">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
