import React, { useEffect } from 'react';

interface AppInitializerProps {
  children: React.ReactNode;
}

const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  useEffect(() => {
    // Security headers setup
    const securityHeaders = {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    };

    // Add basic meta tags
    const metaTags = [
      { name: 'robots', content: 'index, follow' },
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { httpEquiv: 'X-UA-Compatible', content: 'IE=edge' }
    ];

    metaTags.forEach(meta => {
      if (!document.querySelector(`meta[name="${meta.name}"], meta[http-equiv="${meta.httpEquiv}"]`)) {
        const metaTag = document.createElement('meta');
        if (meta.name) metaTag.name = meta.name;
        if (meta.httpEquiv) metaTag.httpEquiv = meta.httpEquiv;
        metaTag.content = meta.content;
        document.head.appendChild(metaTag);
      }
    });

    // Performance monitoring (simplified)
    if (process.env.NODE_ENV === 'development') {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        console.log('Page Load Time:', navigation.loadEventEnd - navigation.loadEventStart, 'ms');
      }
    }

    console.info('Security headers for server setup:', securityHeaders);
  }, []);

  return <>{children}</>;
};

export default AppInitializer;