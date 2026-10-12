import { notFound } from 'next/navigation';
import { PageShell } from '@/components/layout/PageShell';
import { PageBanner } from '@/components/ui/PageBanner/PageBanner';
import { getServicePageData } from '@/lib/api/services';
import { ListingCard } from '@/components/services/ListingCard';
import { ServiceFilters } from '@/components/services/ServiceFilters';
import { OfferCard } from '@/components/home/OffersSection/OfferCard';
import styles from './slug.module.css';

interface Props { params: Promise<{ slug: string }> }

// Store/product data is live (stock, open/closed, new vendors) — this page
// renders per-request rather than being statically generated at build time,
// both because that's the correct behavior for live inventory and because
// static generation would require the backend to be reachable during
// `next build`, which it isn't in most CI/deploy pipelines.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const data = await getServicePageData(slug);
  return { title: data ? `${data.category.title} — Zooli` : 'Service — Zooli' };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const data = await getServicePageData(slug);
  if (!data) notFound();

  const { category, headline, subheadline, listings, featuredOffers } = data;

  return (
    <PageShell>
      <PageBanner
        title={headline}
        subtitle={subheadline}
        icon={category.icon}
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: category.title }]}
      />

      <div className={`${styles.layout} zooli-container`}>
        {/* ── Sidebar filters ── */}
        <aside className={styles.sidebar}>
          <ServiceFilters />
        </aside>

        {/* ── Main content ── */}
        <div className={styles.main}>
          {/* Featured offers strip */}
          {featuredOffers.length > 0 && (
            <div className={styles.offersRow}>
              {featuredOffers.map((offer) => (
                <OfferCard key={offer.id} offer={offer} />
              ))}
            </div>
          )}

          {/* Results header */}
          <div className={styles.resultsHeader}>
            <p className={styles.resultCount}>
              {listings.length} {listings.length === 1 ? 'result' : 'results'} in{' '}
              <strong>Dhone, AP</strong>
            </p>
          </div>

          {/* Listings grid */}
          <div className={styles.listingsGrid}>
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} categorySlug={category.slug} />
            ))}
          </div>

          {listings.length === 0 && (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>No listings yet</p>
              <p className={styles.emptyBody}>We&apos;re onboarding vendors in this category. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </PageShell>
  );
}
