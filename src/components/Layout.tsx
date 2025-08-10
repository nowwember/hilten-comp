import Head from 'next/head';
import Navbar from './Navbar';

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Head>
        <title>{title ? `${title} · ХилтэнКомп` : 'ХилтэнКомп'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8 animate-fade-in-up">{children}</main>
    </div>
  );
}
