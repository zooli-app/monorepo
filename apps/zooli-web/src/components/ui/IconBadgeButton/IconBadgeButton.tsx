import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './IconBadgeButton.module.css';

interface IconBadgeButtonProps {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
}

export function IconBadgeButton({ href, label, count, children }: IconBadgeButtonProps) {
  return (
    <Link href={href} className={styles.button} aria-label={label}>
      {children}
      {!!count && count > 0 && (
        <span className={styles.badge} aria-hidden="true">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
