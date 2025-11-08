import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import HeaderNavigation from "@/components/HeaderNavigation";
import { UserX, ArrowLeft, UserPlus } from "lucide-react";

const PublicProfileNotFound = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[hsl(var(--theme-background))] via-[hsl(var(--theme-backgroundLight))] to-[hsl(var(--theme-background))]">
      <HeaderNavigation isScrolled={false} />
      <div className="max-w-4xl mx-auto pt-20 px-4">
        <div className="text-center py-12">
          <UserX className="w-24 h-24 text-[hsl(var(--theme-primary))]/50 mx-auto mb-6" />
          
          <h1 className="text-3xl font-bold text-[hsl(var(--theme-text))] mb-4 font-mogra">
            User Not Found
          </h1>
          
          <p className="text-[hsl(var(--theme-textMuted))] mb-8 font-kaushan text-lg">
            This profile doesn't exist or hasn't been created yet.
          </p>

          {!user && (
            <div className="max-w-md mx-auto mb-8 bg-[hsl(var(--theme-surface))] border-2 border-[hsl(var(--theme-primary))]/30 rounded-lg p-6">
              <UserPlus className="w-12 h-12 text-[hsl(var(--theme-primary))] mx-auto mb-3" />
              <h3 className="text-lg font-bold text-[hsl(var(--theme-primary))] mb-2 font-merienda">
                Looking to Create Your Profile?
              </h3>
              <p className="text-[hsl(var(--theme-textMuted))] text-sm mb-4 font-kaushan">
                Join Spit Hierarchy to create your own profile, rank your favorite rappers, and join the debate.
              </p>
              <Link
                to="/auth"
                className="inline-block bg-[hsl(var(--theme-primary))] text-[hsl(var(--theme-background))] px-6 py-3 rounded-lg font-bold font-merienda hover:bg-[hsl(var(--theme-primaryLight))] transition-all duration-200 w-full"
              >
                Sign Up Free
              </Link>
            </div>
          )}

          <Link 
            to="/rankings" 
            className="inline-flex items-center gap-2 text-[hsl(var(--theme-primary))] hover:text-[hsl(var(--theme-primaryLight))] font-kaushan transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Rankings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PublicProfileNotFound;
