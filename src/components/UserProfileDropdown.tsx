import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ThemedDropdownMenu, ThemedDropdownMenuContent, ThemedDropdownMenuItem, ThemedDropdownMenuSeparator, ThemedDropdownMenuTrigger } from "@/components/ui/themed-dropdown-menu";
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
  const {
    user,
    signOut
  } = useAuth();
  const getAvatarUrl = (baseUrl?: string) => {
    if (!baseUrl) return undefined;

    // If it's already a full URL, return as is
    if (baseUrl.startsWith('http')) return baseUrl;

    // Construct the thumb size URL for navigation
    return `https://xzcmkssadekswmiqfbff.supabase.co/storage/v1/object/public/avatars/${baseUrl}/thumb.jpg`;
  };
  const avatarUrl = getAvatarUrl(userProfile?.avatar_url);
  const displayName = userProfile?.username || userProfile?.full_name || user?.email;
  return <ThemedDropdownMenu>
      <ThemedDropdownMenuTrigger asChild>
        <div className="cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-[hsl(var(--theme-primary))]/50 hover:border-[hsl(var(--theme-primary))]`}>
            <AvatarImage src={avatarUrl} alt={displayName || 'User'} style={{
            imageRendering: 'crisp-edges'
          }} loading="eager" />
            <AvatarFallback className="bg-gradient-to-r from-[hsl(var(--theme-secondary))] to-[hsl(var(--theme-primary))] text-[hsl(var(--theme-text))]">
              <User className="w-4 h-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </ThemedDropdownMenuTrigger>
      <ThemedDropdownMenuContent align="end" className="w-56 rounded-md border-2 bg-black">
        <div className="px-3 py-2 border-b" style={{
        borderColor: 'hsl(var(--theme-border))/30'
      }}>
          <p className="font-bold text-sm truncate" style={{
          color: 'hsl(var(--theme-primary))',
          fontFamily: 'var(--theme-font-body)'
        }}>
            {displayName}
          </p>
        </div>
        
        <Link to="/profile">
          <ThemedDropdownMenuItem>
            <User className="w-4 h-4 mr-3" />
            View Profile
          </ThemedDropdownMenuItem>
        </Link>
        
        <ThemedDropdownMenuSeparator />
        
        <Link to="/analytics">
          <ThemedDropdownMenuItem>
            <Trophy className="w-4 h-4 mr-3" />
            Analytics
          </ThemedDropdownMenuItem>
        </Link>
        
        {(isAdmin || canManageBlog) && <>
            <ThemedDropdownMenuSeparator />
            <Link to="/admin">
              <ThemedDropdownMenuItem>
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </ThemedDropdownMenuItem>
            </Link>
          </>}
        
        <ThemedDropdownMenuSeparator />
        
        <ThemedDropdownMenuItem onClick={signOut}>
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </ThemedDropdownMenuItem>
      </ThemedDropdownMenuContent>
    </ThemedDropdownMenu>;
};
export default UserProfileDropdown;