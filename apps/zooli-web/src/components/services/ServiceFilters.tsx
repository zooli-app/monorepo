// Client-side filter panel. The state lives here so the parent (Server Component)
// stays serialisable. Wire `onChange` to a query-param router push when the API is live.
'use client';
import { useState } from 'react';
import styles from './ServiceFilters.module.css';

const sortOptions = ['Relevance', 'Rating', 'Delivery time', 'Price: Low to High'];
const ratingOptions = ['4.5+', '4.0+', '3.5+'];

export function ServiceFilters() {
  const [sort, setSort] = useState('Relevance');
  const [rating, setRating] = useState('');
  const [openOnly, setOpenOnly] = useState(false);

  function reset() { setSort('Relevance'); setRating(''); setOpenOnly(false); }

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.panelTitle}>Filters</h2>
        <button type="button" className={styles.resetBtn} onClick={reset}>Reset</button>
      </div>

      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>Sort by</legend>
        <div className={styles.radioList}>
          {sortOptions.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input type="radio" name="sort" value={opt} checked={sort === opt} onChange={() => setSort(opt)} className={styles.radioInput} />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>Minimum rating</legend>
        <div className={styles.radioList}>
          {ratingOptions.map((opt) => (
            <label key={opt} className={styles.radioLabel}>
              <input type="radio" name="rating" value={opt} checked={rating === opt} onChange={() => setRating(opt)} className={styles.radioInput} />
              ⭐ {opt}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.groupLabel}>Availability</legend>
        <label className={styles.toggleLabel}>
          <span>Open now only</span>
          <button
            type="button"
            role="switch"
            aria-checked={openOnly}
            className={styles.toggle}
            data-on={openOnly || undefined}
            onClick={() => setOpenOnly((p) => !p)}
          >
            <span className={styles.toggleThumb} />
          </button>
        </label>
      </fieldset>
    </div>
  );
}
