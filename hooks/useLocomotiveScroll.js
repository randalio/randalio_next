import { useEffect, useRef, useState } from 'react';

export function useLocomotiveScroll(start = true) {
  const scrollRef = useRef(null);
  const locomotiveScrollRef = useRef(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !start) return;

    // Initialize both Locomotive Scroll and Vanilla Tilt
    const initializeScrollAndTilt = async () => {
      const LocomotiveScroll = (await import('locomotive-scroll')).default;
      
      // Initialize Locomotive Scroll
      locomotiveScrollRef.current = new LocomotiveScroll({
        el: scrollRef.current,
        smooth: true,
        multiplier: 1,
        class: 'is-revealed',
        initPosition: { x: 0, y: 0 },
        smartphone: {
          smooth: true,
          getDirection: true,
          getSpeed: true
        },
        tablet: {
          smooth: true,
          getDirection: true,
          getSpeed: true
        }
      });

      // Initialize Vanilla Tilt after Locomotive is ready
      if (typeof window !== 'undefined') {
        const tiltElements = document.querySelectorAll('[data-tilt]');
        if (window.VanillaTilt) {
          tiltElements.forEach(element => {
            window.VanillaTilt.init(element, {
              max: 10,
              speed: 400,
            //   glare: true,
            //   'max-glare': 0.5
            });
          });
        }
      }

      // Update scroll instance
      locomotiveScrollRef.current.update();
    };

    initializeScrollAndTilt();

    // Cleanup function
    return () => {
      if (locomotiveScrollRef.current) {
        locomotiveScrollRef.current.destroy();
      }
      // Destroy vanilla-tilt instances
      const tiltElements = document.querySelectorAll('[data-tilt]');
      tiltElements.forEach(element => {
        if (element.vanillaTilt) {
          element.vanillaTilt.destroy();
        }
      });
    };
  }, [start, isClient]);

  return [scrollRef, locomotiveScrollRef.current];
}