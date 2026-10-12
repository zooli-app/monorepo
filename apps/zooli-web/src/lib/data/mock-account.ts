import type { UserProfile, OrderSummary } from '@/lib/types';

export const mockUserProfile: UserProfile = {
  id: 'user-001',
  name: 'Ravi Kumar',
  phone: '+91 98765 43210',
  email: 'ravi.kumar@email.com',
  avatarInitials: 'RK',
  memberSince: 'June 2024',
  totalOrders: 47,
  wallet: { balanceInr: 320, cashbackInr: 85 },
  savedAddresses: [
    { id: 'addr-1', label: 'Home', line1: '12-34 Gandhi Nagar', city: 'Dhone', state: 'Andhra Pradesh', pincode: '518222', isDefault: true },
    { id: 'addr-2', label: 'Work', line1: 'Plot 5, Industrial Area', city: 'Dhone', state: 'Andhra Pradesh', pincode: '518222', isDefault: false },
  ],
};

export const mockOrders: OrderSummary[] = [
  { id: 'ord-1', displayId: '#ZL004721', placedAt: '2026-06-20T14:30:00Z', status: 'delivered', totalInr: 385, itemCount: 3, vendorName: 'Hotel Srinivasa Grand', category: 'food' },
  { id: 'ord-2', displayId: '#ZL004698', placedAt: '2026-06-18T09:12:00Z', status: 'delivered', totalInr: 1250, itemCount: 8, vendorName: 'Fresh Veggie Hub', category: 'grocery' },
  { id: 'ord-3', displayId: '#ZL004655', placedAt: '2026-06-15T17:45:00Z', status: 'delivered', totalInr: 99, itemCount: 1, vendorName: 'Zooli Rides', category: 'rides' },
  { id: 'ord-4', displayId: '#ZL004589', placedAt: '2026-06-10T11:00:00Z', status: 'cancelled', totalInr: 499, itemCount: 2, vendorName: 'Dhone Biryani House', category: 'food' },
  { id: 'ord-5', displayId: '#ZL004430', placedAt: '2026-05-28T13:20:00Z', status: 'delivered', totalInr: 799, itemCount: 1, vendorName: 'CleanHome Pro', category: 'home-services' },
];
