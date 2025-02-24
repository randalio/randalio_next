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
// Import Locomotive Scroll CSS here instead of in the hook
import 'locomotive-scroll/dist/locomotive-scroll.css';
import dynamic from 'next/dynamic';

// Import Layout with no SSR
const Layout = dynamic(() => import('../components/Layout'), {
  ssr: false
});

export default function MyApp({ Component, pageProps }) {
  useEffect(() => {
    applyWPGlobalStyles()
      .then(styles => {
        console.log('Applied WordPress global styles:');
      })
      .catch(error => {
        console.error('Error applying styles:', error);
      });
  }, []);

  const router = useRouter();

  return (
    <FaustProvider pageProps={pageProps}>
      <WordPressBlocksProvider
        config={{
          theme: fromThemeJson(themeJson),
        }}
      >
        <Layout>
          <Component {...pageProps} key={router.asPath} />
        </Layout>
      </WordPressBlocksProvider>
    </FaustProvider>
  );
}