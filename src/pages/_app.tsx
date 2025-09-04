import type { AppProps } from 'next/app';
import { SessionProvider } from 'next-auth/react';
import { AiExplainProvider } from '@/components/ai/AiExplainProvider';
import Layout from '@/components/Layout';
import dynamic from 'next/dynamic';
import Script from 'next/script';
import '@/styles/globals.css';
import '@/styles/ai-panel.css';

const AiExplainPanel = dynamic(() => import('@/components/ai/AiExplainPanel'), {
  ssr: false,
  loading: () => null
});

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Script
        src="https://polyfill.io/v3/polyfill.min.js?features=es6"
        strategy="beforeInteractive"
      />
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
      <AiExplainProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <AiExplainPanel />
      </AiExplainProvider>
    </SessionProvider>
  );
}


