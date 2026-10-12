import Link from 'next/link';
import type { ServiceCategory } from '@/lib/types';
import { CategoryIcon } from '@/components/icons/CategoryIcon';
import styles from './CategoryCard.module.css';

export function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Link href={category.href} className={styles.card}>
      <span className={styles.iconWrap}>
        <CategoryIcon name={category.icon} className={styles.icon} />
      </span>
      <span className={styles.title}>{category.title}</span>
      {category.badge && <span className={styles.badge}>{category.badge}</span>}
    </Link>
  );
}
