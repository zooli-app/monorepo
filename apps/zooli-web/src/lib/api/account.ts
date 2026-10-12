import type { UserProfile, OrderSummary, OrderStatus } from '@/lib/types';
import { apiGet, USE_MOCKS } from './client';
import { mockUserProfile, mockOrders } from '@/lib/data/mock-account';
import { zooli } from './zooli-client';
import { supabase } from '../supabase';
import { fetchOwnProfile } from '@zooli/api-client';

// Real order_status values (backend) -> this app's simpler OrderStatus union.
const STATUS_MAP: Record<string, OrderStatus> = {
  pending: 'placed', confirmed: 'in-progress', preparing: 'in-progress',
  ready_for_pickup: 'in-progress', out_for_delivery: 'in-progress',
  delivered: 'delivered', cancelled: 'cancelled',
};

export async function getUserProfile(): Promise<UserProfile> {
  if (USE_MOCKS) return mockUserProfile;

  const profile = await fetchOwnProfile(supabase);
  const { data: userData } = await supabase.auth.getUser();
  if (!profile) return mockUserProfile; // not signed in — caller should route to /login

  const { orders } = await zooli.orders.list();
  const { balance, cashbackTotal } = await zooli.wallet.get();
  return {
    id: profile.id,
    name: profile.full_name ?? 'Zooli Customer',
    phone: profile.phone ?? '',
    email: userData.user?.email,
    avatarInitials: (profile.full_name ?? 'ZC').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
    memberSince: userData.user?.created_at ?? new Date().toISOString(),
    totalOrders: orders.length,
    savedAddresses: [], // fetched separately where needed (see CartView) — not part of this summary yet
    wallet: { balanceInr: balance, cashbackInr: cashbackTotal },
  };
}

export async function getOrderHistory(): Promise<OrderSummary[]> {
  if (USE_MOCKS) return mockOrders;

  const { orders } = await zooli.orders.list();
  return orders.map((o) => ({
    id: o.id,
    displayId: `#${o.id.slice(0, 8)}`,
    placedAt: o.created_at,
    status: STATUS_MAP[o.status] ?? 'placed',
    totalInr: o.total,
    itemCount: (o.order_items ?? []).reduce((a, i) => a + i.qty, 0),
    vendorName: o.stores?.name ?? 'Zooli',
    category: (o.stores?.category === 'restaurant' ? 'food' : 'grocery') as OrderSummary['category'],
  }));
}
