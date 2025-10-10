import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface UsernameUpdateResponse {
  success: boolean;
  error?: string;
  message?: string;
  days_remaining?: number;
}

export const useUsernameUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const checkCanChange = async (userId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('can_change_username', { user_id_param: userId });
      
      if (error) throw error;
      return data ?? false;
    } catch (error) {
      console.error('Error checking username change eligibility:', error);
      return false;
    }
  };

  const updateUsername = async (newUsername: string): Promise<UsernameUpdateResponse> => {
    setIsUpdating(true);
    
    try {
      const { data, error } = await supabase
        .rpc('update_own_username', { new_username: newUsername });
      
      if (error) throw error;

      const response = (data as unknown) as UsernameUpdateResponse;
      
      if (response.success) {
        // Invalidate all relevant queries
        await queryClient.invalidateQueries({ queryKey: ['user-profile'] });
        await queryClient.invalidateQueries({ queryKey: ['own-profile'] });
        
        toast.success(response.message || 'Username updated successfully!');
      } else {
        toast.error(response.error || 'Failed to update username');
      }
      
      return response;
    } catch (error) {
      console.error('Error updating username:', error);
      const errorResponse: UsernameUpdateResponse = {
        success: false,
        error: 'An unexpected error occurred. Please try again.'
      };
      toast.error(errorResponse.error);
      return errorResponse;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateUsername,
    checkCanChange,
    isUpdating
  };
};
