import type { ServiceCategory } from '@/lib/types';
import { SpokeDivider } from '@/components/ui/SpokeDivider/SpokeDivider';
import { CategoryCard } from './CategoryCard';
import styles from './CategoryGrid.module.css';

export function CategoryGrid({ categories }: { categories: ServiceCategory[] }) {
  return (
    <section className={`${styles.section} zooli-container`} aria-labelledby="categories-heading">
      <div className={styles.heading}>
        <SpokeDivider />
        <h2 id="categories-heading" className={styles.title}>
          Everything you need, nearby
        </h2>
      </div>
      <div className={styles.grid}>
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </section>
  );
}
