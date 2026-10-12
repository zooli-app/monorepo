import Link from 'next/link';
import type { RideOption } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { ArrowRightIcon } from '@/components/icons/UtilityIcons';
import styles from './RideCard.module.css';

export function RideCard({ ride }: { ride: RideOption }) {
  return (
    <Link href={ride.href} className={styles.card}>
      <span className={styles.iconWrap} data-type={ride.type}>
        <CategoryIcon name="rides" className={styles.icon} />
      </span>
      <div className={styles.body}>
        <p className={styles.label}>{ride.label}</p>
        <p className={styles.description}>{ride.description}</p>
        {(ride.startingFareInr || ride.etaMinutes) && (
          <p className={styles.meta}>
            {ride.startingFareInr && <span>From ₹{ride.startingFareInr}</span>}
            {ride.startingFareInr && ride.etaMinutes && <span aria-hidden="true"> · </span>}
            {ride.etaMinutes && <span>{ride.etaMinutes} min away</span>}
          </p>
        )}
      </div>
      <ArrowRightIcon className={styles.arrow} />
    </Link>
  );
}
