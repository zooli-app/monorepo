import type { HomePageData } from '@/lib/types';
import { apiGet, USE_MOCKS } from './client';
import { mockCategories } from '@/lib/data/mock-categories';
import { mockOffers } from '@/lib/data/mock-offers';
import { mockRides } from '@/lib/data/mock-rides';

// Only grocery/food/ride verticals exist in the real backend so far — the
// other 6 category cards (home-services, house-shifting, parcel, tuition,
// hotel, resorts) stay on their existing hrefs/icons from mock data (no
// live counts to check), while the categories that DO have a real backend
// get their `href` pointed at real data underneath.
export async function getHomePageData(): Promise<HomePageData> {
  if (USE_MOCKS) {
    return {
      location: {
        label: 'Dhone, Andhra Pradesh',
        address: { line1: 'Dhone', city: 'Dhone', state: 'Andhra Pradesh' },
      },
      notifications: { unreadCount: 3 },
      cart: { itemCount: 0 },
      categories: mockCategories,
      offers: mockOffers,
      rides: mockRides,
    };
  }

  return {
    location: {
      label: 'Dhone, Andhra Pradesh',
      address: { line1: 'Dhone', city: 'Dhone', state: 'Andhra Pradesh' },
    },
    notifications: { unreadCount: 0 }, // no notifications backend yet
    cart: { itemCount: 0 },
    categories: mockCategories, // top-level nav cards stay as-is; real data enters one level in (services.ts)
    offers: mockOffers, // no offers/promotions backend yet
    rides: mockRides, // ride *booking* uses real data (see rides.ts); this is just the homepage shortcut icons
  };
}
