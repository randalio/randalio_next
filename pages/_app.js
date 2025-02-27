import '../faust.config';
import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks';
import themeJson from '../../wp/wp-content/themes/twentytwentyfive/theme.json';
import '../globalStylesheet.css';
import { applyWPGlobalStyles } from '../wp-styles';
import '../styles/global.scss';
import '../public/scripts/vanilla-tilt.js';
import '@faustwp/core/dist/css/toolbar.css';
import 'locomotive-scroll/dist/locomotive-scroll.css';
import dynamic from 'next/dynamic';

// Import Layout with no SSR
const Layout = dynamic(() => import('../components/Layout'), {
  ssr: false
});

export default function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Apply WordPress styles
  useEffect(() => {
    applyWPGlobalStyles()
      .then(styles => {
        console.log('Applied WordPress global styles');
      })
      .catch(error => {
        console.error('Error applying styles:', error);
      });
  }, []);

  // Debug route changes
  useEffect(() => {
    const handleRouteChangeStart = (url) => {
      console.log(`Route change starting to: ${url}`);
    };
    
    const handleRouteChangeComplete = (url) => {
      console.log(`Route change completed to: ${url}`);
      // Notify components about the route change
      window.dispatchEvent(new CustomEvent('routeChanged', { 
        detail: { path: url } 
      }));
    };
    
    const handleBeforeHistoryChange = (url) => {
      console.log(`Before history change to: ${url}`);
    };
    
    const handleRouteChangeError = (err, url) => {
      console.error(`Route change to ${url} failed:`, err);
    };

    // Register all router event handlers
    router.events.on('routeChangeStart', handleRouteChangeStart);
    router.events.on('routeChangeComplete', handleRouteChangeComplete);
    router.events.on('beforeHistoryChange', handleBeforeHistoryChange);
    router.events.on('routeChangeError', handleRouteChangeError);

    return () => {
      // Clean up event handlers
      router.events.off('routeChangeStart', handleRouteChangeStart);
      router.events.off('routeChangeComplete', handleRouteChangeComplete);
      router.events.off('beforeHistoryChange', handleBeforeHistoryChange);
      router.events.off('routeChangeError', handleRouteChangeError);
    };
  }, [router]);
  
  // Log current route for debugging
  console.log('Current path:', router.asPath);

  return (
    <FaustProvider pageProps={pageProps}>
      <WordPressBlocksProvider
        config={{
          theme: fromThemeJson(themeJson),
        }}
      >
        <Layout>
          {/* Key prop ensures component fully remounts on route change */}
          <Component {...pageProps} key={router.asPath} />
        </Layout>
      </WordPressBlocksProvider>
    </FaustProvider>
  );
}