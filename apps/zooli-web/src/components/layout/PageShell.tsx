import { Header } from './Header/Header';
import { Footer } from './Footer/Footer';
import { getHomePageData } from '@/lib/api/home';
import type { ReactNode } from 'react';

/** Wraps any server-rendered page with the shared Header + Footer. */
export async function PageShell({ children }: { children: ReactNode }) {
  const { location, notifications, cart, categories } = await getHomePageData();
  return (
    <div className="page-shell">
      <Header location={location} notifications={notifications} cart={cart} categories={categories} />
      <main>{children}</main>
      <Footer />
    </div>
  );
}
