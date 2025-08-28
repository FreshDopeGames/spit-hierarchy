
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
          <Avatar className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-[var(--theme-primary)]/50 hover:border-[var(--theme-primary)]`}>
            <AvatarImage 
              src={avatarUrl} 
              alt={displayName || 'User'}
              style={{ imageRendering: 'crisp-edges' }}
              loading="eager"
            />
            <AvatarFallback className="bg-gradient-to-r from-[var(--theme-secondary)] to-[var(--theme-primary)] text-[var(--theme-text)]">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-[var(--theme-background)] border-[var(--theme-border)] shadow-2xl shadow-[var(--theme-primary)]/20 border-2">
        <div className="px-3 py-2 border-b border-[var(--theme-border)]/30">
          <p className="text-[var(--theme-primary)] font-[var(--theme-font-body)] font-bold text-sm truncate">
            {displayName}
          </p>
        </div>
        
        <Link to="/profile">
          <DropdownMenuItem className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20 hover:text-[var(--theme-primary)] font-[var(--theme-font-body)] cursor-pointer">
            <User className="w-4 h-4 mr-3" />
            View Profile
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuSeparator className="bg-[var(--theme-border)]/30" />
        
        <Link to="/analytics">
          <DropdownMenuItem className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20 hover:text-[var(--theme-primary)] font-[var(--theme-font-body)] cursor-pointer">
            <Trophy className="w-4 h-4 mr-3" />
            Analytics
          </DropdownMenuItem>
        </Link>
        
        {(isAdmin || canManageBlog) && (
          <>
            <DropdownMenuSeparator className="bg-[var(--theme-border)]/30" />
            <Link to="/admin">
              <DropdownMenuItem className="text-[var(--theme-text)] hover:bg-[var(--theme-primary)]/20 hover:text-[var(--theme-primary)] font-[var(--theme-font-body)] cursor-pointer">
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </DropdownMenuItem>
            </Link>
          </>
        )}
        
        <DropdownMenuSeparator className="bg-[var(--theme-border)]/30" />
        
        <DropdownMenuItem onClick={signOut} className="text-[var(--theme-text)] hover:bg-[var(--theme-secondary)]/20 hover:text-[var(--theme-secondary)] font-[var(--theme-font-body)] cursor-pointer">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
