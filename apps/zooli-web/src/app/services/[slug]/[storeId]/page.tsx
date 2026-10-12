"use client";
import { useEffect, useState, use } from "react";
import Link from "next/link";
import { zooli } from "@/lib/api/zooli-client";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { Product, Store, Cart } from "@zooli/api-client";
import styles from "./store.module.css";

export default function StorePage({ params }: { params: Promise<{ slug: string; storeId: string }> }) {
  const { slug, storeId } = use(params);
  const { profile } = useAuth();
  const [store, setStore] = useState<Store | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    const [{ stores }, { products }] = await Promise.all([
      zooli.stores.list(slug === "food" ? "restaurant" : "grocery"),
      zooli.stores.products(storeId),
    ]);
    setStore(stores.find((s) => s.id === storeId) ?? null);
    setProducts(products);
    if (profile) {
      const { cart } = await zooli.cart.get(storeId);
      setCart(cart);
    }
    setLoading(false);
  }
  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [storeId, profile]);

  async function addToCart(productId: string) {
    if (!profile) { window.location.href = `/login?next=/services/${slug}/${storeId}`; return; }
    setBusyId(productId);
    try {
      await zooli.cart.addItem(storeId, productId, 1);
      const { cart } = await zooli.cart.get(storeId);
      setCart(cart);
    } finally {
      setBusyId(null);
    }
  }

  const qtyInCart = (productId: string) =>
    cart?.cart_items?.find((i) => i.product_id === productId)?.qty ?? 0;
  const cartCount = cart?.cart_items?.reduce((a, i) => a + i.qty, 0) ?? 0;

  if (loading) return <div className={styles.loading}>Loading menu...</div>;
  if (!store) return <div className={styles.loading}>Store not found.</div>;

  return (
    <main className={styles.wrap}>
      <header className={styles.header}>
        <div className={styles.headerThumb}>{store.name.charAt(0)}</div>
        <div>
          <h1 className={styles.name}>{store.name}</h1>
          <p className={styles.meta}>{store.address ?? "Address not set"} {!store.is_open && <span className={styles.closed}>· Closed</span>}</p>
        </div>
      </header>

      {!profile && (
        <div className={styles.signinBanner}>
          <Link href={`/login?next=/services/${slug}/${storeId}`}>Sign in</Link> to add items to your cart.
        </div>
      )}

      <div className={styles.grid}>
        {products.map((p) => {
          const inCart = qtyInCart(p.id);
          return (
            <div key={p.id} className={styles.item}>
              <div className={styles.itemThumb} aria-hidden>{p.name.charAt(0)}</div>
              <div className={styles.itemBody}>
                <div className={styles.itemName}>{p.name}</div>
                {p.description && <div className={styles.itemDesc}>{p.description}</div>}
                <div className={styles.itemBottom}>
                  <span className={styles.price}>₹{p.price}<span className={styles.unit}>/{p.unit}</span></span>
                  <button
                    className={styles.addBtn}
                    disabled={!p.is_available || p.stock_qty === 0 || busyId === p.id}
                    onClick={() => addToCart(p.id)}
                  >
                    {!p.is_available || p.stock_qty === 0 ? "Out of stock" : busyId === p.id ? "Adding..." : inCart > 0 ? `In cart · ${inCart}` : "Add"}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        {products.length === 0 && <div className={styles.empty}>No items listed yet.</div>}
      </div>

      {cartCount > 0 && (
        <Link href={`/cart?storeId=${storeId}`} className={styles.cartBar}>
          <span>{cartCount} item{cartCount > 1 ? "s" : ""} in cart</span>
          <span>View Cart →</span>
        </Link>
      )}
    </main>
  );
}
