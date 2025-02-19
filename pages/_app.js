// import { Lato } from '@next/font/google';
import '../faust.config';
import React from 'react';
import {useEffect} from 'react';
import { useRouter } from 'next/router';
import { FaustProvider } from '@faustwp/core';
import { WordPressBlocksProvider, fromThemeJson } from '@faustwp/blocks';
import themeJson from '../../wp/wp-content/themes/twentytwentyfive/theme.json';
import '../globalStylesheet.css';
import { applyWPGlobalStyles } from '../wp-styles';
import '../styles/global.scss';
import '../public/scripts/vanilla-tilt.js';
import '@faustwp/core/dist/css/toolbar.css';



// const lato = Lato({
//   subsets: ['latin'],
//   weight: ['400', '700', '900'],
//   style: ['normal', 'italic'],
//   variable: '--font-lato',
//   display: 'swap',
// })

export default function MyApp({ Component, pageProps }) {

  // In your app's initialization
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
    
    <FaustProvider pageProps={pageProps} >
      <WordPressBlocksProvider
        config={{
          // blocks,
          theme: fromThemeJson(themeJson),
        }}
        >
        <Component {...pageProps} key={router.asPath} />
      </WordPressBlocksProvider>
    </FaustProvider>

  );
}
