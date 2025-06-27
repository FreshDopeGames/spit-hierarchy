
import { useEffect } from 'react';

const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Set Content Security Policy headers via meta tag
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Relaxed for Vite dev
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data:",
      "connect-src 'self' https://xzcmkssadekswmiqfbff.supabase.co wss://xzcmkssadekswmiqfbff.supabase.co",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    document.head.appendChild(cspMeta);

    // Security headers simulation
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
    };

    // Log security headers for development
    console.info('Security headers would be set:', securityHeaders);

    return () => {
      // Cleanup
      const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, []);

  return null;
};

export default ContentSecurityPolicy;
