import type { ServicePageData, ServiceListing } from '@/lib/types';
import { apiGet, USE_MOCKS } from './client';
import { getMockServicePageData } from '@/lib/data/mock-service-listings';
import { mockCategories } from '@/lib/data/mock-categories';
import { zooli } from './zooli-client';
import type { Store } from '@zooli/api-client';

// Only grocery and food ("restaurant" store category) exist in the real
// backend — the other 7 slugs (rides, home-services, house-shifting,
// parcel, tuition, hotel-function-halls, resorts-tourist) have no vendor
// data behind them at all yet, so they fall back to mock listings rather
// than showing an empty page.
const BACKEND_CATEGORY: Record<string, string> = { grocery: 'grocery', food: 'restaurant' };

function toListing(store: Store, slug: string): ServiceListing {
  return {
    id: store.id,
    name: store.name,
    vendorName: store.name,
    rating: 0,        // no ratings/reviews table yet
    reviewCount: 0,
    deliveryTimeMinutes: undefined,
    priceForTwo: undefined,
    startingFareInr: undefined,
    isOpen: store.is_open,
    tags: [],
    category: slug as ServiceListing['category'],
    slug: store.id,   // store detail route uses the store's real id
  };
}

export async function getServicePageData(slug: string): Promise<ServicePageData | null> {
  if (USE_MOCKS) return getMockServicePageData(slug);

  const backendCategory = BACKEND_CATEGORY[slug];
  if (!backendCategory) return getMockServicePageData(slug); // no backend for this vertical yet

  const category = mockCategories.find((c) => c.slug === slug);
  if (!category) return null;

  const { stores } = await zooli.stores.list(backendCategory);
  return {
    category,
    headline: category.title,
    subheadline: `${stores.length} ${stores.length === 1 ? 'place' : 'places'} near you`,
    listings: stores.map((s) => toListing(s, slug)),
    featuredOffers: [], // no offers backend yet
  };
}
