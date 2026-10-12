import type { Notification } from '@/lib/types';
import { mockNotifications } from '@/lib/data/mock-notifications';

// There's no notifications backend yet (no push/in-app notification table
// or endpoint) — this always returns mock data regardless of the
// NEXT_PUBLIC_USE_MOCKS flag, rather than pointing at a real API path that
// doesn't exist.
export async function getNotifications(): Promise<Notification[]> {
  return mockNotifications;
}
