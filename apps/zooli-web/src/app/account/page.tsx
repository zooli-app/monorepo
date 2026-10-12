"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { PageBanner } from '@/components/ui/PageBanner/PageBanner';
import { getUserProfile, getOrderHistory } from '@/lib/api/account';
import { AccountView } from '@/components/account/AccountView';
import { useAuth } from '@/lib/auth/AuthProvider';
import type { UserProfile, OrderSummary } from '@/lib/types';

// Client component for the same reason as /cart: the real profile/orders
// need the browser-only Supabase session, which a server component can't see.
export default function AccountPage() {
  const router = useRouter();
  const { profile: authProfile, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderSummary[]>([]);

  useEffect(() => {
    if (authLoading) return;
    if (!authProfile) { router.replace('/login?next=/account'); return; }
    Promise.all([getUserProfile(), getOrderHistory()]).then(([p, o]) => { setProfile(p); setOrders(o); });
  }, [authLoading, authProfile, router]);

  if (!profile) {
    return (
      <PageShell>
        <div className="zooli-container" style={{ padding: '60px 16px', textAlign: 'center' }}>Loading your account...</div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageBanner
        title={`Hi, ${profile.name.split(' ')[0]}! 👋`}
        subtitle={`Member since ${new Date(profile.memberSince).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })} · ${profile.totalOrders} orders placed`}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Account' }]}
        accentColor="maroon"
      />
      <div className="zooli-container" style={{ paddingBlock: '40px 64px' }}>
        <AccountView profile={profile} orders={orders} />
      </div>
    </PageShell>
  );
}
