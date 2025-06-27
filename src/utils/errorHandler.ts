
import { toast } from 'sonner';

export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  isUserFacing?: boolean;
}

export const createAppError = (
  message: string, 
  code?: string, 
  statusCode?: number,
  isUserFacing = true
): AppError => {
  const error = new Error(message) as AppError;
  error.code = code;
  error.statusCode = statusCode;
  error.isUserFacing = isUserFacing;
  return error;
};

export const handleError = (error: unknown, context?: string) => {
  const appError = error as AppError;
  
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV === 'development') {
    console.error(`Error${context ? ` in ${context}` : ''}:`, error);
  }

  // Show user-friendly message
  if (appError.isUserFacing !== false) {
    const message = appError.message || 'An unexpected error occurred';
    toast.error(message);
  }

  return appError;
};

export const isNetworkError = (error: unknown): boolean => {
  const err = error as any;
  return err?.code === 'NETWORK_ERROR' || 
         err?.message?.includes('fetch') ||
         err?.message?.includes('network');
};

export const isAuthError = (error: unknown): boolean => {
  const err = error as any;
  return err?.statusCode === 401 || 
         err?.code === 'UNAUTHORIZED' ||
         err?.message?.includes('authentication');
};

export const retry = async <T>(
  fn: () => Promise<T>,
  attempts: number = 3,
  delay: number = 1000
): Promise<T> => {
  try {
    return await fn();
  } catch (error) {
    if (attempts > 1 && isNetworkError(error)) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, attempts - 1, delay * 2);
    }
    throw error;
  }
};
