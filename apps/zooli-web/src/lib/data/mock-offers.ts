import type { Offer } from '@/lib/types';

export const mockOffers: Offer[] = [
  {
    id: 'offer-restaurants',
    title: '40% OFF',
    subtitle: 'On restaurants',
    badgeLabel: '40% OFF',
    accent: 'gold',
    href: '/offers/restaurants',
  },
  {
    id: 'offer-grocery',
    title: '₹100 OFF',
    subtitle: 'On grocery orders above ₹499',
    badgeLabel: '₹100 OFF',
    accent: 'leaf',
    href: '/offers/grocery',
  },
  {
    id: 'offer-rides',
    title: '₹50 OFF',
    subtitle: 'On ride bookings',
    badgeLabel: '₹50 OFF',
    accent: 'sky',
    href: '/offers/rides',
  },
  {
    id: 'offer-resorts',
    title: 'Up to 30% OFF',
    subtitle: 'On resorts',
    badgeLabel: '30% OFF',
    accent: 'violet',
    href: '/offers/resorts',
  },
];
