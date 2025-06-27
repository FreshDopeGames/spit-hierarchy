
import { Toaster as SonnerToaster } from "sonner"

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        style: {
          background: 'var(--background)',
          color: 'var(--foreground)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '12px 16px',
          fontSize: '14px',
          minHeight: '48px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          maxWidth: '350px',
          wordBreak: 'break-word',
        },
        className: 'toast-container',
      }}
      className="toaster-wrapper"
      style={{
        '--normal-bg': 'var(--background)',
        '--normal-border': 'var(--border)',
        '--normal-text': 'var(--foreground)',
        '--success-bg': 'hsl(142 76% 36%)',
        '--success-border': 'hsl(142 76% 36%)',
        '--success-text': 'hsl(355.7 100% 97.3%)',
        '--error-bg': 'hsl(0 84% 60%)',
        '--error-border': 'hsl(0 84% 60%)',
        '--error-text': 'hsl(0 0% 98%)',
      }}
    />
  )
}
