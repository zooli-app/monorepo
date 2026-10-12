import { getHomePageData } from '@/lib/api/home';
import { Header } from '@/components/layout/Header/Header';
import { Footer } from '@/components/layout/Footer/Footer';
import { Hero } from '@/components/home/Hero/Hero';
import { CategoryGrid } from '@/components/home/CategoryGrid/CategoryGrid';
import { OffersSection } from '@/components/home/OffersSection/OffersSection';
import { RideBookingSection } from '@/components/home/RideBooking/RideBookingSection';

// Revisit per category latency budget once the live API is wired up.
export const revalidate = 60;

export default async function HomePage() {
  const { location, notifications, cart, categories, offers, rides } = await getHomePageData();

  return (
    <>
      <Header location={location} notifications={notifications} cart={cart} categories={categories} />
      <main>
        <Hero />
        <CategoryGrid categories={categories} />
        <OffersSection offers={offers} />
        <RideBookingSection rides={rides} />
      </main>
      <Footer />
    </>
  );
}
