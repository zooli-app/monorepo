import { PageShell } from '@/components/layout/PageShell';
import { PageBanner } from '@/components/ui/PageBanner/PageBanner';
import { getNotifications } from '@/lib/api/notifications';
import { NotificationList } from '@/components/notifications/NotificationList';

export const metadata = { title: 'Notifications — Zooli' };

export default async function NotificationsPage() {
  const notifications = await getNotifications();
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <PageShell>
      <PageBanner
        title={unreadCount > 0 ? `${unreadCount} new notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
        subtitle="Stay updated with your orders, offers and more"
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Notifications' }]}
      />
      <div className="zooli-container" style={{ paddingBlock: '40px 64px', maxWidth: '720px' }}>
        <NotificationList notifications={notifications} />
      </div>
    </PageShell>
  );
}
