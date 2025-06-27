
import { useEffect } from 'react';

const ContentSecurityPolicy = () => {
  useEffect(() => {
    // Enhanced Content Security Policy headers
    const cspMeta = document.createElement('meta');
    cspMeta.httpEquiv = 'Content-Security-Policy';
    cspMeta.content = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdnjs.cloudflare.com", // Relaxed for Vite dev but more restrictive
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' data: https://fonts.gstatic.com",
      "connect-src 'self' https://xzcmkssadekswmiqfbff.supabase.co wss://xzcmkssadekswmiqfbff.supabase.co https://*.supabase.co",
      "media-src 'self' https:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "frame-src 'none'",
      "worker-src 'self' blob:",
      "manifest-src 'self'",
      "upgrade-insecure-requests"
    ].join('; ');
    
    // Remove existing CSP meta tag if present
    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    if (existingMeta) {
      existingMeta.remove();
    }
    
    document.head.appendChild(cspMeta);

    // Enhanced security headers simulation (for development awareness)
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Resource-Policy': 'same-origin'
    };

    // Log security headers for development
    console.info('Security headers that should be set on server:', securityHeaders);

    // Add security-related meta tags
    const securityMetas = [
      { name: 'robots', content: 'index, follow' },
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' }
    ];

    securityMetas.forEach(meta => {
      const metaTag = document.createElement('meta');
      if (meta.name) metaTag.name = meta.name;
      if (meta.httpEquiv) metaTag.httpEquiv = meta.httpEquiv;
      metaTag.content = meta.content;
      document.head.appendChild(metaTag);
    });

    return () => {
      // Cleanup
      const cspToRemove = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspToRemove) {
        cspToRemove.remove();
      }
      
      securityMetas.forEach(meta => {
        const selector = meta.name ? `meta[name="${meta.name}"]` : `meta[http-equiv="${meta.httpEquiv}"]`;
        const metaToRemove = document.querySelector(selector);
        if (metaToRemove) {
          metaToRemove.remove();
        }
      });
    };
  }, []);

  return null;
};

export default ContentSecurityPolicy;

