'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import type { UserProfile, OrderSummary, OrderStatus } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { useAuth } from '@/lib/auth/AuthProvider';
import { zooli } from '@/lib/api/zooli-client';
import styles from './AccountView.module.css';

const tabs = ['Orders', 'Addresses', 'Wallet', 'Settings'] as const;
type Tab = typeof tabs[number];

function statusMeta(s: OrderStatus) {
  const map: Record<OrderStatus, { label: string; color: string }> = {
    delivered:    { label: 'Delivered',   color: 'leaf' },
    cancelled:    { label: 'Cancelled',   color: 'red' },
    'in-progress':{ label: 'On the way',  color: 'sky' },
    placed:       { label: 'Placed',      color: 'gold' },
  };
  return map[s];
}

function fmt(n: number) { return `₹${n.toLocaleString('en-IN')}`; }

function dateStr(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function AccountView({ profile, orders }: { profile: UserProfile; orders: OrderSummary[] }) {
  const [tab, setTab] = useState<Tab>('Orders');
  const router = useRouter();
  const { logout } = useAuth();
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());
  const [draftRating, setDraftRating] = useState(5);
  const [draftComment, setDraftComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submitReview(orderId: string) {
    setSubmitting(true);
    try {
      await zooli.reviews.create(orderId, draftRating, draftComment || undefined);
      setReviewedIds((s) => new Set(s).add(orderId));
      setReviewingId(null);
      setDraftComment('');
      setDraftRating(5);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.layout}>
      {/* ── Left sidebar ── */}
      <aside className={styles.sidebar}>
        {/* Avatar card */}
        <div className={styles.avatarCard}>
          <div className={styles.avatar}>{profile.avatarInitials}</div>
          <div>
            <p className={styles.profileName}>{profile.name}</p>
            <p className={styles.profilePhone}>{profile.phone}</p>
            {profile.email && <p className={styles.profileEmail}>{profile.email}</p>}
          </div>
        </div>

        {/* Wallet quick-view */}
        <div className={styles.walletCard}>
          <p className={styles.walletLabel}>Zooli Wallet</p>
          <p className={styles.walletBalance}>{fmt(profile.wallet.balanceInr)}</p>
          {profile.wallet.cashbackInr > 0 && (
            <p className={styles.walletCashback}>+ {fmt(profile.wallet.cashbackInr)} cashback available</p>
          )}
        </div>

        {/* Nav tabs */}
        <nav className={styles.tabNav} aria-label="Account sections">
          {tabs.map((t) => (
            <button
              key={t}
              type="button"
              className={styles.tabBtn}
              data-active={tab === t || undefined}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
          <button type="button" className={`${styles.tabBtn} ${styles.logoutBtn}`} onClick={() => logout().then(() => router.push('/'))}>Log out</button>
        </nav>
      </aside>

      {/* ── Main panel ── */}
      <div className={styles.main}>
        {tab === 'Orders' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Order History</h2>
            <div className={styles.orderList}>
              {orders.map((order) => {
                const { label, color } = statusMeta(order.status);
                return (
                  <div key={order.id} className={styles.orderCard}>
                    <span className={styles.orderIcon}>
                      <CategoryIcon name={order.category} className={styles.orderCatIcon} />
                    </span>
                    <div className={styles.orderBody}>
                      <div className={styles.orderTopRow}>
                        <p className={styles.orderVendor}>{order.vendorName}</p>
                        <span className={styles.statusPill} data-color={color}>{label}</span>
                      </div>
                      <p className={styles.orderMeta}>{order.displayId} · {order.itemCount} item{order.itemCount > 1 ? 's' : ''} · {dateStr(order.placedAt)}</p>
                    </div>
                    <p className={styles.orderTotal}>{fmt(order.totalInr)}</p>
                    {order.status === 'delivered' && !reviewedIds.has(order.id) && (
                      reviewingId === order.id ? (
                        <div className={styles.reviewForm} onClick={(e) => e.stopPropagation()}>
                          <div className={styles.reviewStars}>
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button key={n} type="button" onClick={() => setDraftRating(n)} className={styles.reviewStarBtn} aria-label={`${n} stars`}>
                                {n <= draftRating ? '★' : '☆'}
                              </button>
                            ))}
                          </div>
                          <input className={styles.reviewInput} placeholder="Say something (optional)" value={draftComment} onChange={(e) => setDraftComment(e.target.value)} />
                          <button type="button" className={styles.reorderBtn} disabled={submitting} onClick={() => submitReview(order.id)}>
                            {submitting ? 'Sending...' : 'Submit'}
                          </button>
                        </div>
                      ) : (
                        <button type="button" className={styles.reorderBtn} onClick={() => setReviewingId(order.id)}>Rate order</button>
                      )
                    )}
                    <button type="button" className={styles.reorderBtn}>Reorder</button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {tab === 'Addresses' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Saved Addresses</h2>
            <div className={styles.addressList}>
              {profile.savedAddresses.map((addr) => (
                <div key={addr.id} className={styles.addressCard}>
                  <div className={styles.addrIcon}>{addr.label === 'Home' ? '🏠' : '💼'}</div>
                  <div className={styles.addrBody}>
                    <p className={styles.addrLabel}>{addr.label} {addr.isDefault && <span className={styles.defaultBadge}>Default</span>}</p>
                    <p className={styles.addrLine}>{addr.line1}</p>
                    <p className={styles.addrLine}>{addr.city}, {addr.state} — {addr.pincode}</p>
                  </div>
                  <div className={styles.addrActions}>
                    <button type="button" className={styles.addrBtn}>Edit</button>
                    {!addr.isDefault && <button type="button" className={styles.addrBtn}>Set default</button>}
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addAddressBtn}>+ Add new address</button>
            </div>
          </div>
        )}

        {tab === 'Wallet' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Zooli Wallet</h2>
            <div className={styles.walletDetail}>
              <div className={styles.walletBigCard}>
                <p className={styles.walletBigLabel}>Available Balance</p>
                <p className={styles.walletBigAmount}>{fmt(profile.wallet.balanceInr)}</p>
                <p className={styles.walletNote}>{fmt(profile.wallet.cashbackInr)} cashback pending</p>
              </div>
              <div className={styles.walletActions}>
                <button type="button" className={styles.walletActionBtn}>Add Money</button>
                <button type="button" className={`${styles.walletActionBtn} ${styles.walletActionSecondary}`}>Transaction History</button>
              </div>
              <div className={styles.walletInfo}>
                <p className={styles.walletInfoItem}>💡 Zooli Wallet is accepted across all services</p>
                <p className={styles.walletInfoItem}>🎁 Earn 2% cashback on every completed order or ride</p>
                <p className={styles.walletInfoItem}>⚡ Instant refunds credited to your wallet</p>
              </div>
            </div>
          </div>
        )}

        {tab === 'Settings' && (
          <div className={styles.panel}>
            <h2 className={styles.panelTitle}>Account Settings</h2>
            <div className={styles.settingsList}>
              {[
                { label: 'Full Name', value: profile.name },
                { label: 'Phone Number', value: profile.phone },
                { label: 'Email', value: profile.email ?? 'Not added' },
              ].map((field) => (
                <div key={field.label} className={styles.settingRow}>
                  <div>
                    <p className={styles.settingLabel}>{field.label}</p>
                    <p className={styles.settingValue}>{field.value}</p>
                  </div>
                  <button type="button" className={styles.editBtn}>Edit</button>
                </div>
              ))}
              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingLabel}>Language</p>
                  <p className={styles.settingValue}>English / తెలుగు</p>
                </div>
                <button type="button" className={styles.editBtn}>Change</button>
              </div>
              <div className={styles.settingRow}>
                <div>
                  <p className={styles.settingLabel}>Notifications</p>
                  <p className={styles.settingValue}>Orders, Offers, Rides</p>
                </div>
                <button type="button" className={styles.editBtn}>Manage</button>
              </div>
            </div>
            <div className={styles.dangerZone}>
              <h3 className={styles.dangerTitle}>Danger Zone</h3>
              <button type="button" className={styles.deleteBtn}>Delete Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
