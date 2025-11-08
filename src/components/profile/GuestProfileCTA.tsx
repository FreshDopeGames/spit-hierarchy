import { Link } from 'react-router-dom';
import { Users, Vote, MessageSquare } from 'lucide-react';

interface GuestProfileCTAProps {
  variant?: 'banner' | 'inline' | 'floating';
  context?: string;
}

const GuestProfileCTA = ({ variant = 'inline', context = 'interact' }: GuestProfileCTAProps) => {
  if (variant === 'banner') {
    return (
      <div className="bg-gradient-to-r from-[hsl(var(--theme-surface))] to-[hsl(var(--theme-backgroundLight))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-6 text-center">
        <h3 className="text-xl font-bold text-[hsl(var(--theme-primary))] mb-2 font-mogra">
          Join the Culture
        </h3>
        <p className="text-[hsl(var(--theme-text))] mb-4 font-kaushan">
          Sign up to create your own rankings, vote on debates, and rep your favorites
        </p>
        <Link
          to="/auth"
          className="inline-block bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-background))] px-6 py-3 rounded-lg font-bold font-merienda hover:bg-[hsl(var(--theme-primaryLight))] transition-all duration-200"
        >
          Sign Up Free
        </Link>
      </div>
    );
  }

  if (variant === 'floating') {
    return (
      <div className="fixed bottom-6 right-6 z-50 bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))] rounded-lg shadow-lg shadow-[hsl(var(--theme-primary))]/20 p-4 max-w-sm animate-in slide-in-from-bottom-5">
        <div className="flex items-start gap-3">
          <Users className="w-6 h-6 text-[hsl(var(--theme-primary))] flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="text-sm text-[hsl(var(--theme-text))] mb-3 font-kaushan">
              Want to {context}? Join Spit Hierarchy!
            </p>
            <Link
              to="/auth"
              className="block text-center bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-background))] px-4 py-2 rounded font-bold text-sm font-merienda hover:bg-[hsl(var(--theme-primaryLight))] transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Inline variant
  return (
    <div className="flex items-center gap-3 bg-[hsl(var(--theme-surface))]/50 border border-[hsl(var(--theme-primary))]/20 rounded-lg p-4">
      <div className="flex gap-2">
        <Vote className="w-5 h-5 text-[hsl(var(--theme-primary))]/50" />
        <MessageSquare className="w-5 h-5 text-[hsl(var(--theme-primary))]/50" />
      </div>
      <p className="text-sm text-[hsl(var(--theme-textMuted))] flex-1 font-kaushan">
        <Link 
          to="/auth" 
          className="text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] font-semibold underline"
        >
          Sign up
        </Link>
        {' '}to vote, comment, and create your own rankings
      </p>
    </div>
  );
};

export default GuestProfileCTA;
