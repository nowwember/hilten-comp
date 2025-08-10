import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== 'undefined' ? localStorage.getItem('theme') : null;
    const preferDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = stored ?? (preferDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  return (
    <SessionProvider session={session}>
      {/* Avoid FOUC when switching themes */}
      <div style={{ visibility: mounted ? 'visible' : 'hidden' }}>
        <Component {...pageProps} />
      </div>
    </SessionProvider>
  );
}


