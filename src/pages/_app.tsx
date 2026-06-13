import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AiExplainProvider } from '@/components/ai/AiExplainProvider';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import { Unbounded, Onest, JetBrains_Mono } from 'next/font/google';
import '@/styles/globals.css';
import '@/styles/ai-panel.css';

const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '600', '800'],
  variable: '--font-display',
  display: 'swap',
});

const onest = Onest({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-body',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-mono',
  display: 'swap',
});

const AiExplainPanel = dynamic(() => import('@/components/ai/AiExplainPanel'), {
  ssr: false,
  loading: () => null
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Script
        id="MathJax-config"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.MathJax = {
              tex: {
                inlineMath: [['$', '$'], ['\\\\(', '\\\\)']],
                displayMath: [['$$', '$$'], ['\\\\[', '\\\\]']],
                processEscapes: true,
                processEnvironments: true
              },
              options: {
                ignoreHtmlClass: '.*|',
                processHtmlClass: 'arithmatex'
              }
            };
          `,
        }}
      />
      <Script
        id="MathJax-script"
        src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined' && (window as any).MathJax && (window as any).MathJax.typesetPromise) {
            (window as any).MathJax.typesetPromise();
          }
        }}
      />
      <div className={`${unbounded.variable} ${onest.variable} ${jetbrainsMono.variable} font-body`}>
        <AiExplainProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
          <AiExplainPanel />
        </AiExplainProvider>
      </div>
    </SessionProvider>
  );
}
