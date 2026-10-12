import Link from 'next/link';
import { ArrowRightIcon } from '@/components/icons/UtilityIcons';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import type { CategoryIconName } from '@/lib/types';
import styles from './PageBanner.module.css';

interface Crumb { label: string; href?: string }

interface PageBannerProps {
  title: string;
  subtitle?: string;
  icon?: CategoryIconName;
  breadcrumbs?: Crumb[];
  accentColor?: 'violet' | 'gold' | 'leaf' | 'maroon';
}

export function PageBanner({ title, subtitle, icon, breadcrumbs, accentColor = 'violet' }: PageBannerProps) {
  return (
    <div className={styles.banner} data-accent={accentColor}>
      <div className={`${styles.inner} zooli-container`}>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className={styles.crumbItem}>
                {i > 0 && <ArrowRightIcon className={styles.crumbSep} />}
                {crumb.href ? (
                  <Link href={crumb.href} className={styles.crumbLink}>{crumb.label}</Link>
                ) : (
                  <span className={styles.crumbCurrent} aria-current="page">{crumb.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <div className={styles.content}>
          {icon && (
            <span className={styles.iconWrap}>
              <CategoryIcon name={icon} className={styles.icon} />
            </span>
          )}
          <div>
            <h1 className={styles.title}>{title}</h1>
            {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
