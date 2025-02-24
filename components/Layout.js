import { useLocomotiveScroll } from '../hooks/useLocomotiveScroll';
import dynamic from 'next/dynamic';

const Layout = ({ children }) => {
  const [containerRef] = useLocomotiveScroll(true);

  return (
    <div
      ref={containerRef}
      data-scroll-container
      className="relative min-h-screen w-full"
    >
      {children}
    </div>
  );
};

export default dynamic(() => Promise.resolve(Layout), {
  ssr: false
});