import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Settings, Bell, LogOut, Trophy } from "lucide-react";
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
  const getUserInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    if (userProfile?.username) {
      return userProfile.username.substring(0, 2).toUpperCase();
    }
    if (user?.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return 'U';
  };
  return <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center space-x-3 cursor-pointer hover:opacity-80 transition-opacity">
          <Avatar className={`transition-all duration-300 ${isScrolled ? 'w-8 h-8' : 'w-10 h-10'} border-2 border-rap-gold/50 hover:border-rap-gold`}>
            <AvatarImage src={userProfile?.avatar_url} alt={userProfile?.username || 'User'} />
            <AvatarFallback className="bg-gradient-to-r from-rap-burgundy to-rap-gold text-rap-platinum font-mogra text-sm">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="text-rap-gold font-kaushan text-sm">
            {userProfile?.username || user?.email}
          </span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-black border-rap-gold/30 shadow-2xl shadow-rap-gold/20 border-2">
        <Link to="/profile">
          <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
            <User className="w-4 h-4 mr-3" />
            View Profile
          </DropdownMenuItem>
        </Link>
        
        <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
          <Bell className="w-4 h-4 mr-3" />
          Notifications
        </DropdownMenuItem>
        
        <DropdownMenuSeparator className="bg-rap-smoke/30" />
        
        <Link to="/analytics">
          <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
            <Trophy className="w-4 h-4 mr-3" />
            Analytics
          </DropdownMenuItem>
        </Link>
        
        {(isAdmin || canManageBlog) && <>
            <DropdownMenuSeparator className="bg-rap-smoke/30" />
            <Link to="/admin">
              <DropdownMenuItem className="text-rap-platinum hover:bg-rap-gold/20 hover:text-rap-gold font-kaushan cursor-pointer">
                <Settings className="w-4 h-4 mr-3" />
                Admin Panel
              </DropdownMenuItem>
            </Link>
          </>}
        
        <DropdownMenuSeparator className="bg-rap-smoke/30" />
        
        <DropdownMenuItem onClick={signOut} className="text-rap-platinum hover:bg-rap-burgundy/20 hover:text-rap-burgundy font-kaushan cursor-pointer">
          <LogOut className="w-4 h-4 mr-3" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>;
};
export default UserProfileDropdown;