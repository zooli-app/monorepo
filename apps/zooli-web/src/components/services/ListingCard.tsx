import Link from 'next/link';
import type { ServiceListing } from '@/lib/types';
import styles from './ListingCard.module.css';

interface Props { listing: ServiceListing; categorySlug: string }

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.starRow} aria-label={`Rating: ${rating} out of 5`}>
      <svg viewBox="0 0 12 12" className={styles.star}><path d="M6 1l1.4 3h3.1l-2.5 1.8 1 3L6 7.2 3 8.8l1-3L1.5 4H4.6L6 1Z" fill="currentColor"/></svg>
      {rating.toFixed(1)}
    </span>
  );
}

export function ListingCard({ listing, categorySlug }: Props) {
  return (
    <Link href={`/services/${categorySlug}/${listing.slug}`} className={styles.card}>
      {/* Placeholder image area */}
      <div className={styles.thumb} aria-hidden="true">
        <span className={styles.thumbInitial}>{listing.name.charAt(0)}</span>
        {!listing.isOpen && <span className={styles.closedBadge}>Closed</span>}
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <p className={styles.name}>{listing.name}</p>
          <StarRating rating={listing.rating} />
        </div>
        <p className={styles.vendor}>{listing.vendorName}</p>

        <div className={styles.meta}>
          {listing.deliveryTimeMinutes && (
            <span className={styles.metaChip}>
              <svg viewBox="0 0 14 14" className={styles.metaIcon} fill="none"><circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.4"/><path d="M7 4.5V7l1.5 1.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              {listing.deliveryTimeMinutes} min
            </span>
          )}
          {listing.priceForTwo && (
            <span className={styles.metaChip}>₹{listing.priceForTwo} for two</span>
          )}
          {listing.startingFareInr && (
            <span className={styles.metaChip}>From ₹{listing.startingFareInr}</span>
          )}
        </div>

        <div className={styles.tags}>
          {listing.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.tag}>{tag}</span>
          ))}
        </div>
      </div>
    </Link>
  );
}
