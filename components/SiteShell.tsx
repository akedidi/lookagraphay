'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CartDrawer from '@/components/CartDrawer';
import { CartProvider } from '@/lib/cart';
import { hasHeroUserGesture, isMobileHeroViewport, markHeroUserGesture } from '@/lib/hero-sound';

export default function SiteShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin || isMobileHeroViewport() || hasHeroUserGesture()) return;

    const mark = () => {
      markHeroUserGesture();
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
      window.removeEventListener('wheel', mark);
    };

    const opts = { passive: true } as const;
    window.addEventListener('pointerdown', mark, opts);
    window.addEventListener('keydown', mark);
    window.addEventListener('wheel', mark, opts);

    return () => {
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', mark);
      window.removeEventListener('wheel', mark);
    };
  }, [isAdmin]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CartProvider>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
