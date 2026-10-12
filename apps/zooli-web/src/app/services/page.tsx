import { PageShell } from '@/components/layout/PageShell';
import { PageBanner } from '@/components/ui/PageBanner/PageBanner';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import { mockCategories } from '@/lib/data/mock-categories';
import Link from 'next/link';
import styles from './services.module.css';

export const metadata = { title: 'All Services — Zooli' };

const descriptions: Record<string, string> = {
  'food': 'Order from local restaurants & home kitchens',
  'grocery': 'Fresh vegetables, fruits & daily staples',
  'rides': 'Bike, auto & cab rides around Dhone',
  'home-services': 'Electricians, plumbers, cleaners & more',
  'house-shifting': 'Packers & movers for local & outstation',
  'parcel': 'Fast tracked parcel delivery within city',
  'tuition': 'Tutors for school, college & competitive exams',
  'hotel-function-halls': 'Book hotels & function halls for events',
  'resorts-tourist': 'Day trips, resorts & weekend getaways',
};

export default async function ServicesPage() {
  return (
    <PageShell>
      <PageBanner
        title="All Services"
        subtitle="From food to house moves — everything you need, delivered."
        breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Services' }]}
      />
      <div className={`${styles.grid} zooli-container`}>
        {mockCategories.map((cat) => (
          <Link key={cat.id} href={cat.href} className={styles.card}>
            <span className={styles.iconWrap}>
              <CategoryIcon name={cat.icon} className={styles.icon} />
            </span>
            <div className={styles.body}>
              <p className={styles.title}>{cat.title}</p>
              <p className={styles.desc}>{descriptions[cat.slug] ?? ''}</p>
            </div>
            <svg className={styles.arrow} viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
