'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HomeIcon, GridIcon, OrdersIcon, HeartIcon, UserNavIcon } from '@/components/icons/NavIcons';
import styles from './MobileNav.module.css';

interface MobileNavProps {
  notifCount: number;
  cartCount: number;
}

const navItems = [
  { href: '/',              label: 'Home',     Icon: HomeIcon },
  { href: '/services',     label: 'Services', Icon: GridIcon },
  { href: '/orders',       label: 'Orders',   Icon: OrdersIcon },
  { href: '/cart',         label: 'Cart',     Icon: HeartIcon },
  { href: '/account',      label: 'Account',  Icon: UserNavIcon },
] as const;

export function MobileNav({ notifCount, cartCount }: MobileNavProps) {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {navItems.map(({ href, label, Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        const badge = href === '/cart' ? cartCount : href === '/account' ? notifCount : 0;
        return (
          <Link key={href} href={href} className={styles.item} data-active={isActive || undefined} aria-current={isActive ? 'page' : undefined}>
            <span className={styles.iconWrap}>
              <Icon className={styles.icon} />
              {badge > 0 && <span className={styles.badge}>{badge > 9 ? '9+' : badge}</span>}
            </span>
            <span className={styles.label}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
