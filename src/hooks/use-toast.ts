
// This file is deprecated - use 'sonner' toast directly instead
// Import: import { toast } from 'sonner';
// Usage: toast.success('Success message') or toast.error('Error message')

export { toast as useToast } from 'sonner';

// Temporary compatibility wrapper
export const toast = (options: { title: string; description?: string; variant?: 'destructive' }) => {
  const { default: sonnerToast } = require('sonner');
  
  if (options.variant === 'destructive') {
    sonnerToast.error(options.title, { description: options.description });
  } else {
    sonnerToast.success(options.title, { description: options.description });
  }
  
  return { id: '', dismiss: () => {}, update: () => {} };
};
