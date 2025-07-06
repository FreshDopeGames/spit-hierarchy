import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export const useUserProfile = () => {
  const { user, loading: authLoading } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      // If auth is still loading, keep loading state
      if (authLoading) {
        setLoading(true);
        return;
      }

      // If no user, clear profile and stop loading
      if (!user) {
        setUserProfile(null);
        setLoading(false);
        setError(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user profile:', error);
          setError(error.message);
          setUserProfile(null);
          return;
        }

        setUserProfile(data);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to fetch user profile');
        setUserProfile(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [user, authLoading]);

  return { 
    userProfile, 
    loading: authLoading || loading, // Combined loading state
    error 
  };
};
