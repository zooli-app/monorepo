import Link from 'next/link';
import type { Offer } from '@/lib/types';
import { ArrowRightIcon } from '@/components/icons/UtilityIcons';
import styles from './OfferCard.module.css';

export function OfferCard({ offer }: { offer: Offer }) {
  return (
    <Link href={offer.href} className={styles.card} data-accent={offer.accent}>
      <span className={styles.badgeLabel}>{offer.badgeLabel}</span>
      <p className={styles.subtitle}>{offer.subtitle}</p>
      <span className={styles.cta}>
        Grab it
        <ArrowRightIcon className={styles.ctaIcon} />
      </span>
    </Link>
  );
}
