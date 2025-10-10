import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface UsernameLinkProps {
  userId: string;
  username: string;
  className?: string;
}

export const UsernameLink = ({ userId, username, className = '' }: UsernameLinkProps) => {
  const { user } = useAuth();

  // Don't make anonymous or missing usernames clickable
  if (!username || username === "Anonymous User" || !userId) {
    return (
      <span className={`text-[hsl(var(--theme-textMuted))] ${className}`}>
        {username || "Anonymous User"}
      </span>
    );
  }

  // Check if this is the current user's profile
  const isOwnProfile = user?.id === userId;
  const targetPath = isOwnProfile ? '/profile' : `/user/${username}`;

  return (
    <Link
      to={targetPath}
      className={`text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] transition-colors duration-200 cursor-pointer ${className}`}
      onClick={(e) => e.stopPropagation()} // Prevent triggering parent click handlers
      aria-label={isOwnProfile ? 'View your profile' : `View ${username}'s profile`}
    >
      {username}
    </Link>
  );
};
