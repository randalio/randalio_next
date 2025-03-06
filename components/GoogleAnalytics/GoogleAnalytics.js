import React, { useEffect } from 'react';
import { useRouter } from '@faustwp/core';

const GoogleAnalytics = () => {
  const router = useRouter();
  const GA_MEASUREMENT_ID = 'G-25G1BMKMBV'; // Replace with your actual Measurement ID

  useEffect(() => {
    // Add Google Analytics script tag directly
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag() {
      window.dataLayer.push(arguments);
    }
    gtag('js', new Date());
    gtag('config', GA_MEASUREMENT_ID, {
      send_page_view: false // We'll handle page views manually for better SPA support
    });
    
    // Track initial page view
    gtag('event', 'page_view', {
      page_path: window.location.pathname,
    });

    // Set up page view tracking on route changes
    const handleRouteChange = (url) => {
      gtag('event', 'page_view', {
        page_path: url,
      });
    };

    // Subscribe to router events
    if (router && router.events) {
      router.events.on('routeChangeComplete', handleRouteChange);
    }

    // Clean up
    return () => {
      if (router && router.events) {
        router.events.off('routeChangeComplete', handleRouteChange);
      }
    };
  }, [router, GA_MEASUREMENT_ID]);

  return null;
};

export default GoogleAnalytics;