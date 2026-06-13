import Head from 'next/head';
import { useRouter } from 'next/router';
import Navbar from './Navbar';

const FULL_WIDTH_ROUTES = ['/'];

export default function Layout({ title, children }: { title?: string; children: React.ReactNode }) {
  const { pathname } = useRouter();
  const fullWidth = FULL_WIDTH_ROUTES.includes(pathname);

  return (
    <div className="min-h-screen aurora-bg" style={{ backgroundColor: 'var(--bg-base)', color: 'var(--text-primary)' }}>
      <Head>
        <title>{title ? `${title} · ХилтэнКомп` : 'ХилтэнКомп'}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <Navbar />
      <main className={`relative z-10 ${fullWidth ? '' : 'max-w-6xl mx-auto px-4 py-8 animate-fade-in-up'}`}>{children}</main>
    </div>
  );
}
