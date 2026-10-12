import Link from 'next/link';
import Image from 'next/image';
import { SpokeDivider } from '@/components/ui/SpokeDivider/SpokeDivider';
import styles from './Footer.module.css';

const footerColumns = [
  {
    heading: 'Services',
    links: [
      { label: 'Food & Beverages', href: '/services/food' },
      { label: 'Vegetables & Grocery', href: '/services/grocery' },
      { label: 'Rides', href: '/services/rides' },
      { label: 'Home Services', href: '/services/home-services' },
      { label: 'Parcel (Local)', href: '/services/parcel' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About Veera Smart Services', href: '/about' },
      { label: 'Careers', href: '/careers' },
      { label: 'Partner with Zooli', href: '/partner' },
      { label: 'Press', href: '/press' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { label: 'Help centre', href: '/support' },
      { label: 'Safety', href: '/safety' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Privacy policy', href: '/privacy' },
    ],
  },
];

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`${styles.top} zooli-container`}>
        <div className={styles.brandCol}>
          <Link href="/" className={styles.brand}>
            <Image
              src="/zooli-logo.png"
              alt="Zooli — Move Fast, Stay Connected"
              width={900}
              height={361}
              className={styles.logoMark}
            />
          </Link>
          <p className={styles.tagline} lang="te">
            ప్రతి అవసరానికి ఒక నమ్మకం
          </p>
          <p className={styles.legalName}>Veera Smart Services India Pvt Ltd</p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.heading} className={styles.col}>
            <h3 className={styles.colHeading}>{column.heading}</h3>
            <ul className={styles.colList}>
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className={styles.colLink}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="zooli-container">
        <SpokeDivider />
      </div>

      <div className={`${styles.bottom} zooli-container`}>
        <p>© {new Date().getFullYear()} Veera Smart Services India Pvt Ltd. All rights reserved.</p>
        <p>Made for Dhone, Andhra Pradesh and beyond.</p>
      </div>
    </footer>
  );
}
