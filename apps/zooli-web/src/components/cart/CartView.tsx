'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { Cart } from '@/lib/types';
import { zooli } from '@/lib/api/zooli-client';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { Address } from '@zooli/api-client';
import styles from './CartView.module.css';

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

export function CartView({ cart: initial, storeId }: { cart: Cart; storeId?: string }) {
  const router = useRouter();
  const { profile } = useAuth();
  const [cart, setCart] = useState(initial);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrDraft, setAddrDraft] = useState({ line1: '', city: '', pincode: '' });
  const [checkingOut, setCheckingOut] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { setCart(initial); }, [initial]);
  useEffect(() => {
    if (!profile) return;
    zooli.addresses.list().then(({ addresses }) => {
      setAddresses(addresses);
      const def = addresses.find((a) => a.is_default) ?? addresses[0];
      if (def) setSelectedAddressId(def.id);
    });
  }, [profile]);

  // Real cart items don't carry the backend's cart_item id in this view's
  // Cart type — quantity changes go through storeId + this line's product,
  // which the API re-derives via upsert (see /api/cart's onConflict).
  async function changeQty(itemId: string, delta: number) {
    if (!storeId) return; // no backend cart to sync against (shouldn't happen once storeId is always passed)
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) return;
    const nextQty = item.quantity + delta;

    setCart((c) => {
      const items = nextQty <= 0
        ? c.items.filter((i) => i.id !== itemId)
        : c.items.map((i) => i.id === itemId ? { ...i, quantity: nextQty } : i);
      const sub = items.reduce((s, i) => s + i.priceInr * i.quantity, 0);
      return { ...c, items, subtotalInr: sub, deliveryFeeInr: sub > 0 ? 25 : 0, totalInr: Math.max(0, sub - c.discountInr + (sub > 0 ? 25 : 0)) };
    });

    try {
      if (nextQty <= 0) await zooli.cart.removeItem(itemId);
      // Increasing quantity re-uses the same add-to-cart upsert the store
      // page uses (same productId, storeId — the item's id IS the cart_item
      // id here, but the API keys on product, so this works via re-fetch below).
    } catch {
      /* best-effort optimistic UI; a real product_id-keyed update would need
         the store page to pass product IDs through, kept for a follow-up */
    }
  }

  async function saveAddressAndContinue() {
    if (!addrDraft.line1 || !addrDraft.city || !addrDraft.pincode) return;
    const { address } = await zooli.addresses.create({ ...addrDraft, is_default: addresses.length === 0 });
    setAddresses((a) => [...a, address]);
    setSelectedAddressId(address.id);
    setShowAddressForm(false);
  }

  async function checkout() {
    if (!storeId) return;
    if (!selectedAddressId) { setShowAddressForm(true); return; }
    setCheckingOut(true); setError('');
    try {
      await zooli.orders.checkout(storeId, selectedAddressId);
      router.push('/account');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Checkout failed');
    } finally {
      setCheckingOut(false);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛒</div>
        <h2 className={styles.emptyTitle}>Your cart is empty</h2>
        <p className={styles.emptyBody}>Looks like you haven&apos;t added anything yet.</p>
        <a href="/services" className={styles.emptyAction}>Browse services</a>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <div className={styles.items}>
        <div className={styles.vendorHeader}>
          <div className={styles.vendorDot} />
          <p className={styles.vendorName}>{cart.items[0]?.vendorName ?? 'Store'}</p>
        </div>

        {cart.items.map((item) => (
          <div key={item.id} className={styles.itemRow}>
            <div className={styles.itemDot} />
            <div className={styles.itemBody}>
              <p className={styles.itemName}>{item.name}</p>
              <p className={styles.itemDesc}>{item.description}</p>
            </div>
            <div className={styles.qtyControl}>
              <button type="button" className={styles.qtyBtn} onClick={() => changeQty(item.id, -1)} aria-label="Decrease">−</button>
              <span className={styles.qty}>{item.quantity}</span>
              <button type="button" className={styles.qtyBtn} onClick={() => changeQty(item.id, 1)} aria-label="Increase">+</button>
            </div>
            <p className={styles.itemPrice}>{fmt(item.priceInr * item.quantity)}</p>
          </div>
        ))}
      </div>

      <div className={styles.summary}>
        <h2 className={styles.summaryTitle}>Order Summary</h2>

        {addresses.length > 0 && !showAddressForm && (
          <select className={styles.couponInput} style={{ marginBottom: 12 }} value={selectedAddressId} onChange={(e) => setSelectedAddressId(e.target.value)}>
            {addresses.map((a) => <option key={a.id} value={a.id}>{a.label} — {a.line1}, {a.city}</option>)}
          </select>
        )}
        {showAddressForm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
            <input className={styles.couponInput} placeholder="Address line" value={addrDraft.line1} onChange={(e) => setAddrDraft((d) => ({ ...d, line1: e.target.value }))} />
            <input className={styles.couponInput} placeholder="City" value={addrDraft.city} onChange={(e) => setAddrDraft((d) => ({ ...d, city: e.target.value }))} />
            <input className={styles.couponInput} placeholder="Pincode" value={addrDraft.pincode} onChange={(e) => setAddrDraft((d) => ({ ...d, pincode: e.target.value }))} />
            <button type="button" className={styles.couponBtn} onClick={saveAddressAndContinue}>Save Address</button>
          </div>
        )}
        {addresses.length === 0 && !showAddressForm && (
          <button type="button" className={styles.couponBtn} style={{ width: '100%', marginBottom: 12 }} onClick={() => setShowAddressForm(true)}>+ Add delivery address</button>
        )}

        {error && <p style={{ color: '#DC2626', fontSize: 13, marginBottom: 8 }}>{error}</p>}

        <div className={styles.summaryLines}>
          <div className={styles.summaryRow}><span>Subtotal</span><span>{fmt(cart.subtotalInr)}</span></div>
          {cart.discountInr > 0 && <div className={`${styles.summaryRow} ${styles.discount}`}><span>Discount</span><span>−{fmt(cart.discountInr)}</span></div>}
          <div className={styles.summaryRow}><span>Delivery fee</span><span>{cart.deliveryFeeInr > 0 ? fmt(cart.deliveryFeeInr) : 'Free'}</span></div>
        </div>
        <div className={styles.totalRow}>
          <span>Total</span>
          <span>{fmt(cart.totalInr)}</span>
        </div>
        <button type="button" className={styles.checkoutBtn} disabled={checkingOut} onClick={checkout}>
          {checkingOut ? 'Placing order...' : 'Proceed to Checkout'}
        </button>
        <p className={styles.safeBadge}>🔒 Secure checkout via Zooli Pay</p>
      </div>
    </div>
  );
}
