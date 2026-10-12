import Image from 'next/image';
import Link from 'next/link';
import type { LocationSummary, NotificationSummary, CartSummary, ServiceCategory } from '@/lib/types';
import { SearchBar } from '@/components/ui/SearchBar/SearchBar';
import { IconBadgeButton } from '@/components/ui/IconBadgeButton/IconBadgeButton';
import { MobileNav } from './MobileNav';
import {
  PinIcon, ChevronDownIcon, LanguageIcon, BellIcon, CartIcon, UserIcon,
} from '@/components/icons/UtilityIcons';
import styles from './Header.module.css';

interface HeaderProps {
  location: LocationSummary;
  notifications: NotificationSummary;
  cart: CartSummary;
  categories: ServiceCategory[];
}

export function Header({ location, notifications, cart, categories }: HeaderProps) {
  return (
    <>
      <header className={styles.header}>
        {/* ── top bar ── */}
        <div className={`${styles.topBar} zooli-container`}>
          <Link href="/" className={styles.brand} aria-label="Zooli home">
            {/* White plate keeps the indigo lettering readable on the violet header */}
            <span className={styles.logoPlate}>
              <Image
                src="/zooli-logo.png"
                alt="Zooli — Move Fast, Stay Connected"
                width={900}
                height={361}
                className={styles.logoMark}
                priority
              />
            </span>
          </Link>

          {/* location — hide on small screens */}
          <button type="button" className={styles.locationButton}>
            <PinIcon className={styles.locationPin} />
            <span className={styles.locationText}>
              <span className={styles.locationLabel}>Delivering to</span>
              <span className={styles.locationValue}>{location.label}</span>
            </span>
            <ChevronDownIcon className={styles.locationChevron} />
          </button>

          <div className={styles.searchSlot}>
            <SearchBar />
          </div>

          <nav className={styles.actions} aria-label="Account and notifications">
            <button type="button" className={styles.languageButton} aria-label="Change language">
              <LanguageIcon className={styles.languageIcon} />
            </button>
            <IconBadgeButton href="/notifications" label="Notifications" count={notifications.unreadCount}>
              <BellIcon />
            </IconBadgeButton>
            <IconBadgeButton href="/cart" label="Cart" count={cart.itemCount}>
              <CartIcon />
            </IconBadgeButton>
            <Link href="/account" className={styles.accountButton} aria-label="Your account">
              <UserIcon />
            </Link>
          </nav>
        </div>

        {/* ── mobile search row ── */}
        <div className={styles.mobileSearchRow}>
          <div className="zooli-container">
            <SearchBar />
          </div>
        </div>

        {/* ── category strip ── */}
        <div className={styles.subNavWrap}>
          <ul className={`${styles.subNav} zooli-container`}>
            {categories.map((category) => (
              <li key={category.id}>
                <Link href={category.href} className={styles.subNavLink}>
                  {category.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </header>

      {/* ── mobile bottom nav ── */}
      <MobileNav notifCount={notifications.unreadCount} cartCount={cart.itemCount} />
    </>
  );
}
