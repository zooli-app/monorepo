import type { Notification } from '@/lib/types';

export const mockNotifications: Notification[] = [
  { id: 'n1', type: 'order', title: 'Order Delivered! 🎉', body: 'Your order #ZL004721 from Hotel Srinivasa Grand has been delivered. Enjoy your meal!', isRead: false, createdAt: '2026-06-20T14:55:00Z', href: '/orders/ZL004721' },
  { id: 'n2', type: 'offer', title: '40% OFF on your next order', body: 'Use code ZOOLI40 to get 40% off on your next food order. Valid till midnight!', isRead: false, createdAt: '2026-06-20T10:00:00Z', href: '/offers' },
  { id: 'n3', type: 'ride', title: 'Your ride is arriving', body: 'Ramu (Auto #AP21 KL 4532) is 2 minutes away. Please be ready at your pickup point.', isRead: false, createdAt: '2026-06-19T18:30:00Z' },
  { id: 'n4', type: 'offer', title: 'Weekend grocery deal', body: 'Get ₹100 off on grocery orders above ₹499. Shop from Fresh Veggie Hub and more.', isRead: true, createdAt: '2026-06-18T09:00:00Z', href: '/services/grocery' },
  { id: 'n5', type: 'order', title: 'Order Placed Successfully', body: 'We\'ve received your order #ZL004698 from Fresh Veggie Hub. Estimated delivery: 25 mins.', isRead: true, createdAt: '2026-06-18T08:45:00Z' },
  { id: 'n6', type: 'system', title: 'New area unlocked 🗺️', body: 'Zooli now serves Alur and Peapally! Invite your friends and get ₹50 cashback per referral.', isRead: true, createdAt: '2026-06-15T12:00:00Z' },
];
