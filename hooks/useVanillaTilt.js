// hooks/useVanillaTilt.js
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export function useVanillaTilt() {
  const router = useRouter();

  useEffect(() => {
    let tiltInitialized = false;
    
    // Check if VanillaTilt is loaded
    const isVanillaTiltLoaded = () => {
      return typeof window !== 'undefined' && window.VanillaTilt;
    };

    // Load VanillaTilt if not available
    const loadVanillaTilt = () => {
      return new Promise((resolve, reject) => {
        if (isVanillaTiltLoaded()) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = '/scripts/vanilla-tilt.js';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load VanillaTilt'));
        document.body.appendChild(script);
      });
    };

    // Initialize or reinitialize tilt on elements
    const initTilt = async () => {
      try {
        // Make sure VanillaTilt is loaded
        if (!isVanillaTiltLoaded()) {
          await loadVanillaTilt();
        }

        // Get all elements with data-tilt attribute
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        if (tiltElements.length === 0) {
          console.log('No tilt elements found');
          return;
        }

        console.log(`Found ${tiltElements.length} tilt elements`);

        // Clean up any existing instances
        tiltElements.forEach(element => {
          if (element.vanillaTilt) {
            element.vanillaTilt.destroy();
          }
        });

        // Initialize new instances
        tiltElements.forEach(element => {
          window.VanillaTilt.init(element, {
            max: 10,
            speed: 400,
            glare: false,
          });
        });

        tiltInitialized = true;
        console.log('Tilt successfully initialized');
      } catch (error) {
        console.error('Error initializing tilt:', error);
      }
    };

    // Initialize on mount
    const timer = setTimeout(() => {
      initTilt();
    }, 500);

    // Handle route changes
    const handleRouteChange = () => {
      console.log('Route changed, reinitializing tilt');
      setTimeout(initTilt, 500);
    };

    router.events.on('routeChangeComplete', handleRouteChange);

    // Check periodically for new tilt elements
    const intervalCheck = setInterval(() => {
      if (!tiltInitialized || document.querySelectorAll('[data-tilt]').length > 0) {
        initTilt();
      }
    }, 2000);

    // Clean up
    return () => {
      clearTimeout(timer);
      clearInterval(intervalCheck);
      router.events.off('routeChangeComplete', handleRouteChange);
    };
  }, [router.events]);
}

// Usage in your Layout component:
// import { useVanillaTilt } from '../hooks/useVanillaTilt';
// 
// export default function Layout({ children }) {
//   useVanillaTilt();
//   // rest of your component
// }