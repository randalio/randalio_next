import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function QRRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    if (router.isReady) {
      router.push({
        pathname: '/',
        query: { source: 'qr-redirect' }
      });
    }
  }, [router.isReady]);

  // Optional loading state while redirect happens
  return <div>Loading...</div>;
}

// If you need to ensure the page is pre-rendered
export async function getStaticProps() {
  return {
    props: {}
  };
}
