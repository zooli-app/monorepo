import Link from 'next/link';
import type { Notification, NotifType } from '@/lib/types';
import styles from './NotificationList.module.css';

function typeLabel(type: NotifType) {
  const map: Record<NotifType, string> = { order: '📦 Order', offer: '🎁 Offer', ride: '🚗 Ride', system: '🔔 Zooli' };
  return map[type];
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'Just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export function NotificationList({ notifications }: { notifications: Notification[] }) {
  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className={styles.list}>
      {unread.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>New</h2>
          {unread.map((n) => <NotifItem key={n.id} n={n} />)}
        </section>
      )}
      {read.length > 0 && (
        <section>
          <h2 className={styles.sectionLabel}>Earlier</h2>
          {read.map((n) => <NotifItem key={n.id} n={n} />)}
        </section>
      )}
    </div>
  );
}

function NotifItem({ n }: { n: Notification }) {
  const inner = (
    <div className={styles.item} data-unread={!n.isRead || undefined}>
      <span className={styles.dot} data-unread={!n.isRead || undefined} />
      <div className={styles.body}>
        <div className={styles.topRow}>
          <span className={styles.typePill}>{typeLabel(n.type)}</span>
          <span className={styles.time}>{timeAgo(n.createdAt)}</span>
        </div>
        <p className={styles.title}>{n.title}</p>
        <p className={styles.bodyText}>{n.body}</p>
      </div>
    </div>
  );
  return n.href ? <Link href={n.href}>{inner}</Link> : inner;
}
