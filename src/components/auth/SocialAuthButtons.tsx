
/* SOCIAL_AUTH_DISABLED - This component is temporarily disabled but preserved for future restoration
   See docs/SOCIAL_AUTH_RESTORATION.md for re-integration instructions */

/* 
import { Button } from "@/components/ui/button";

interface SocialAuthButtonsProps {
  socialLoading: string | null;
  onSocialAuth: (provider: 'google' | 'facebook' | 'twitter') => void;
}

// FUTURE_USE: This component structure is preserved for when social auth is re-enabled
const SocialAuthButtons = ({ socialLoading, onSocialAuth }: SocialAuthButtonsProps) => {
  return (
    <div className="space-y-3">
      <Button 
        onClick={() => onSocialAuth('google')} 
        disabled={socialLoading === 'google'} 
        variant="outline" 
        className="w-full bg-rap-carbon/50 border-rap-silver/30 text-rap-silver hover:bg-rap-burgundy/20 font-merienda"
      >
        {socialLoading === 'google' ? "Connecting..." : (
          <>
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            Continue with Google
          </>
        )}
      </Button>

      <Button 
        onClick={() => onSocialAuth('facebook')} 
        disabled={socialLoading === 'facebook'} 
        variant="outline" 
        className="w-full bg-blue-600/20 border-blue-500/30 text-rap-silver hover:bg-blue-600/30 font-merienda"
      >
        {socialLoading === 'facebook' ? "Connecting..." : (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            Continue with Facebook
          </>
        )}
      </Button>

      <Button 
        onClick={() => onSocialAuth('twitter')} 
        disabled={socialLoading === 'twitter'} 
        variant="outline" 
        className="w-full bg-rap-carbon/20 border-rap-smoke/30 text-rap-silver hover:bg-rap-carbon/30 font-merienda"
      >
        {socialLoading === 'twitter' ? "Connecting..." : (
          <>
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
            Continue with X
          </>
        )}
      </Button>
    </div>
  );
};

export default SocialAuthButtons;
SOCIAL_AUTH_DISABLED */

// FUTURE_USE: SocialAuthButtonsProps interface preserved for restoration
export interface SocialAuthButtonsProps {
  socialLoading: string | null;
  onSocialAuth: (provider: 'google' | 'facebook' | 'twitter') => void;
}

// Temporary placeholder component - remove this when restoring social auth
const SocialAuthButtonsDisabled = () => {
  return null;
};

export default SocialAuthButtonsDisabled;
