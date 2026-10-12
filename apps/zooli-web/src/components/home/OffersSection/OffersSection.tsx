import Link from 'next/link';
import type { Offer } from '@/lib/types';
import { SpokeDivider } from '@/components/ui/SpokeDivider/SpokeDivider';
import { OfferCard } from './OfferCard';
import styles from './OffersSection.module.css';

export function OffersSection({ offers }: { offers: Offer[] }) {
  return (
    <section className={`${styles.section} zooli-container`} aria-labelledby="offers-heading">
      <div className={styles.headingRow}>
        <div className={styles.heading}>
          <SpokeDivider />
          <h2 id="offers-heading" className={styles.title}>
            Offers for you
          </h2>
        </div>
        <Link href="/offers" className={styles.viewAll}>
          View all offers
        </Link>
      </div>
      <div className={styles.grid}>
        {offers.map((offer) => (
          <OfferCard key={offer.id} offer={offer} />
        ))}
      </div>
    </section>
  );
}
