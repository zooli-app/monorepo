import type { Cart } from '@/lib/types';
import { apiGet, USE_MOCKS } from './client';
import { mockCart } from '@/lib/data/mock-cart';
import { zooli } from './zooli-client';

// The real cart is scoped to a single store (see apps/api's schema — one
// cart per user per store). `storeId` must come from wherever the person
// is shopping; when absent (e.g. a stale /cart bookmark) this returns an
// empty cart rather than guessing which store's cart to show.
export async function getCart(storeId?: string, storeName = '', category: string = 'grocery'): Promise<Cart> {
  if (USE_MOCKS) return mockCart;
  if (!storeId) return { items: [], subtotalInr: 0, discountInr: 0, deliveryFeeInr: 0, totalInr: 0 };

  const { cart } = await zooli.cart.get(storeId);
  if (!cart) return { items: [], subtotalInr: 0, discountInr: 0, deliveryFeeInr: 0, totalInr: 0 };

  const items = cart.cart_items.map((i) => ({
    id: i.id,
    name: i.products.name,
    description: '',
    priceInr: i.products.price,
    quantity: i.qty,
    vendorName: storeName,
    category: category as Cart['items'][number]['category'],
  }));
  const subtotalInr = items.reduce((a, i) => a + i.priceInr * i.quantity, 0);
  const deliveryFeeInr = subtotalInr > 0 ? 25 : 0; // matches apps/api's flat groceries delivery fee
  return { items, subtotalInr, discountInr: 0, deliveryFeeInr, totalInr: subtotalInr + deliveryFeeInr };
}
