import Link from 'next/link';
import type { RideOption } from '@/lib/types';
import { SpokeDivider } from '@/components/ui/SpokeDivider/SpokeDivider';
import { RideCard } from './RideCard';
import styles from './RideBookingSection.module.css';

export function RideBookingSection({ rides }: { rides: RideOption[] }) {
  return (
    <section className={`${styles.section} zooli-container`} aria-labelledby="rides-heading">
      <div className={styles.headingRow}>
        <div className={styles.heading}>
          <SpokeDivider />
          <h2 id="rides-heading" className={styles.title}>
            Book your ride
          </h2>
        </div>
        <Link href="/services/rides" className={styles.viewAll}>
          View all rides
        </Link>
      </div>
      <div className={styles.grid}>
        {rides.map((ride) => (
          <RideCard key={ride.id} ride={ride} />
        ))}
      </div>
    </section>
  );
}
