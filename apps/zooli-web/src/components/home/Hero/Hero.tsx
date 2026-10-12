import Link from 'next/link';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { ArrowRightIcon } from '@/components/icons/UtilityIcons';
import { WheelGraphic } from './WheelGraphic';
import styles from './Hero.module.css';

const orbitItems = [
  { icon: 'food', label: 'Food', style: styles.orbitTop },
  { icon: 'grocery', label: 'Grocery', style: styles.orbitRight },
  { icon: 'rides', label: 'Rides', style: styles.orbitBottom },
  { icon: 'parcel', label: 'Parcel', style: styles.orbitLeft },
] as const;

export function Hero() {
  return (
    <section className={styles.hero}>
      <div className={`${styles.inner} zooli-container`}>
        <div className={styles.copy}>
          <p className={styles.eyebrow} lang="te">
            ప్రతి అవసరానికి ఒక నమ్మకం
          </p>
          <h1 className={styles.heading}>
            One trust,
            <br />
            for every need.
          </h1>
          <p className={styles.subcopy}>
            From dinner tonight to your next house move — Zooli brings food, groceries, rides, home
            services and stays to Dhone and the towns around it, all tracked from one place.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/services/food" className={styles.ctaPrimary}>
              Order food now
              <ArrowRightIcon className={styles.ctaIcon} />
            </Link>
            <Link href="/services/rides" className={styles.ctaSecondary}>
              Book a ride
            </Link>
          </div>
          <dl className={styles.statRow}>
            <div className={styles.stat}>
              <dt>Serving</dt>
              <dd>Dhone &amp; 40+ towns</dd>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.stat}>
              <dt>Categories</dt>
              <dd>9 everyday services</dd>
            </div>
            <div className={styles.statDivider} aria-hidden="true" />
            <div className={styles.stat}>
              <dt>Avg. delivery</dt>
              <dd>28 minutes</dd>
            </div>
          </dl>
        </div>

        <div className={styles.visual} aria-hidden="true">
          <div className={styles.wheelStage}>
            <WheelGraphic />
            {orbitItems.map((item) => (
              <div key={item.label} className={`${styles.orbitChip} ${item.style}`}>
                <CategoryIcon name={item.icon} className={styles.orbitIcon} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <div className={styles.statusCard}>
            <span className={styles.statusDot} />
            <div>
              <p className={styles.statusTitle}>Your grocery order</p>
              <p className={styles.statusMeta}>Arriving in 12 min · Auto #AP21</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
