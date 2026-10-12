"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { PageShell } from '@/components/layout/PageShell';
import { PageBanner } from '@/components/ui/PageBanner/PageBanner';
import { getCart } from '@/lib/api/cart';
import { CartView } from '@/components/cart/CartView';
import type { Cart } from '@/lib/types';

// Client component (not a server component) because the real cart needs
// the signed-in user's Supabase session, which only exists in the browser
// (this app's Supabase client persists sessions to localStorage, not
// cookies, so a server component has no way to read it).
function CartPageInner() {
  const params = useSearchParams();
  const storeId = params.get('storeId') ?? undefined;
  const [cart, setCart] = useState<Cart | null>(null);

  useEffect(() => {
    getCart(storeId).then(setCart);
  }, [storeId]);

  if (!cart) {
    return (
      <PageShell>
        <div className="zooli-container" style={{ padding: '60px 16px', textAlign: 'center' }}>Loading your cart...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageBanner
        title="Your Cart"
        subtitle={cart.items.length > 0 ? `${cart.items.length} item${cart.items.length > 1 ? 's' : ''} from ${cart.items[0]?.vendorName}` : 'Your cart is empty'}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Cart' }]}
        accentColor="leaf"
      />
      <div className="zooli-container" style={{ paddingBlock: '40px 64px' }}>
        <CartView cart={cart} storeId={storeId} />
      </div>
    </PageShell>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<PageShell><div className="zooli-container" style={{ padding: '60px 16px', textAlign: 'center' }}>Loading...</div></PageShell>}>
      <CartPageInner />
    </Suspense>
  );
}
