
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EmailConfirmationHandler = () => {
  useEffect(() => {
    // Handle email confirmation on page load
    const handleEmailConfirmation = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('token');
      const type = urlParams.get('type');

      if (token && type === 'signup') {
        try {
          const { error } = await supabase.auth.verifyOtp({
            token_hash: token,
            type: 'signup'
          });

          if (error) {
            console.error('Email confirmation error:', error);
            toast.error('Email confirmation failed. Please try signing up again.');
          } else {
            toast.success('Email confirmed! Welcome to Spit Hierarchy!');
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        } catch (error) {
          console.error('Email confirmation error:', error);
          toast.error('Email confirmation failed. Please try signing up again.');
        }
      }
    };

    handleEmailConfirmation();
  }, []);

  return null; // This component doesn't render anything
};

export default EmailConfirmationHandler;
