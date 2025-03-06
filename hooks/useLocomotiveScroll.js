import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';

export function useLocomotiveScroll(start = true) {
  const scrollRef = useRef(null);
  const locomotiveScrollRef = useRef(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  // Set isClient on mount
  useEffect(() => {
    setIsClient(true);
  }, []);

  // This effect handles scroll position resetting on route change
  useEffect(() => {
    if (!isClient) return;

    const handleBeforeRouteChange = () => {
      // Before changing routes, scroll to top
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.scrollTo(0, { duration: 0, disableLerp: true });
      }
    };

    router.events.on('routeChangeStart', handleBeforeRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleBeforeRouteChange);
    };
  }, [isClient, router.events]);

  // Initialize/reinitialize Locomotive Scroll
  useEffect(() => {
    if (!isClient || !start) return;

    // Create a flag to track initialization state
    let isInitializing = true;

    const initializeLocomotiveScroll = async () => {
      try {
        const LocomotiveScroll = (await import('locomotive-scroll')).default;
        
        // Destroy existing instance if it exists
        if (locomotiveScrollRef.current) {
          locomotiveScrollRef.current.destroy();
        }
        
        // Slight delay to ensure DOM is ready
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Check if component is still mounted
        if (!isInitializing) return;
        
        locomotiveScrollRef.current = new LocomotiveScroll({
          el: scrollRef.current,
          smooth: true,
          smartphone: {
            smooth: false
          },
          lerp: 0.1,
          // rest of your config
        });
        
        locomotiveScrollRef.current.update();
        console.log("Locomotive scroll initialized for path:", router.asPath);
        
        // Force update after a brief delay to handle any dynamic content
        setTimeout(() => {
          if (locomotiveScrollRef.current) {
            locomotiveScrollRef.current.update();
          }
        }, 500);

        // Handle initial hash in URL if present
        if (window.location.hash) {
          const targetId = window.location.hash.substring(1);
          scrollToElementById(targetId);
        }
      } catch (error) {
        console.error("Error initializing Locomotive:", error);
      }
    };

    // Function to scroll to a specific element ID using Locomotive Scroll
    const scrollToElementById = (id) => {
      if (!locomotiveScrollRef.current) return;
      
      setTimeout(() => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
          locomotiveScrollRef.current.scrollTo(targetElement, {
            offset: 0,
            duration: 1000,
            disableLerp: false,
          });
          console.log(`Scrolled to element with ID: ${id}`);
        } else {
          console.warn(`Element with ID: ${id} not found`);
        }
      }, 100); // Small delay to ensure the element is available
    };

    // Custom route change handler
    const handleRouteChanged = () => {
      console.log("Route changed event detected, updating locomotive scroll");
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.update();
      }
    };

    // Handle hash change events
    const handleHashChange = () => {
      if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        scrollToElementById(targetId);
      }
    };

    // Handle clicks on hash links
    const handleHashLinkClick = (e) => {
      const target = e.target.closest('a');
      if (!target) return;
      
      const href = target.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      
      e.preventDefault();
      const targetId = href.substring(1);
      
      // Update the URL without triggering a page reload
      window.history.pushState(null, '', href);
      
      // Scroll to the element
      scrollToElementById(targetId);
    };

    window.addEventListener('routeChanged', handleRouteChanged);
    window.addEventListener('hashchange', handleHashChange);
    document.body.addEventListener('click', handleHashLinkClick);
    
    initializeLocomotiveScroll();

    return () => {
      isInitializing = false;
      window.removeEventListener('routeChanged', handleRouteChanged);
      window.removeEventListener('hashchange', handleHashChange);
      document.body.removeEventListener('click', handleHashLinkClick);
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
      }
    };
  }, [isClient, start, router.asPath]); // Re-initialize on route change
  
  // Initialize VanillaTilt
  useEffect(() => {
    if (!isClient || !start) return;
    
    const initializeTilt = () => {
      if (typeof window !== 'undefined' && window.VanillaTilt) {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        
        // Destroy existing instances first
        tiltElements.forEach(element => {
          if (element.vanillaTilt) {
            element.vanillaTilt.destroy();
          }
        });
        
        // Initialize new instances
        if (tiltElements.length > 0) {
          tiltElements.forEach(element => {
            window.VanillaTilt.init(element, {
              max: 10,
              speed: 400,
            });
          });
          console.log("VanillaTilt initialized for path:", router.asPath);
        }
      }
    };

    // Custom route change handler
    const handleRouteChanged = () => {
      console.log("Route changed event detected, reinitializing VanillaTilt");
      // Add a short delay to ensure the DOM has updated
      setTimeout(initializeTilt, 200);
    };

    window.addEventListener('routeChanged', handleRouteChanged);
    
    // Small delay helps with DOM readiness
    const timeout = setTimeout(() => {
      initializeTilt();
    }, 200);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('routeChanged', handleRouteChanged);
    };
  }, [isClient, start, router.asPath]); // Re-initialize on route change

  return [scrollRef, locomotiveScrollRef.current];
}