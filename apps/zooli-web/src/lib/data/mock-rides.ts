import type { RideOption } from '@/lib/types';

export const mockRides: RideOption[] = [
  {
    id: 'ride-car',
    type: 'car',
    label: 'Car',
    description: '4 Seater • AC',
    startingFareInr: 99,
    etaMinutes: 4,
    href: '/rides/car',
  },
  {
    id: 'ride-auto',
    type: 'auto',
    label: 'Auto',
    description: '3 Seater',
    startingFareInr: 49,
    etaMinutes: 3,
    href: '/rides/auto',
  },
  {
    id: 'ride-bike',
    type: 'bike',
    label: 'Bike',
    description: '1 Rider',
    startingFareInr: 29,
    etaMinutes: 2,
    href: '/rides/bike',
  },
];
