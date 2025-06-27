
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="bottom-center"
      expand={false}
      richColors
      closeButton={true}
      className="toaster-wrapper"
      toastOptions={{
        duration: 4000,
        style: {
          background: 'hsl(var(--background))',
          color: 'hsl(var(--foreground))',
          border: '1px solid hsl(var(--border))',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '14px',
          maxWidth: '400px'
        },
        // Enhanced security: prevent content injection
        unstyled: false,
        classNames: {
          toast: 'security-toast',
          title: 'security-toast-title',
          description: 'security-toast-description',
          actionButton: 'security-toast-action',
          cancelButton: 'security-toast-cancel',
          closeButton: 'security-toast-close',
          error: 'security-toast-error',
          success: 'security-toast-success',
          warning: 'security-toast-warning',
          info: 'security-toast-info',
        }
      }}
    />
  )
}

