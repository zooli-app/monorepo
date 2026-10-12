import styles from './SpokeDivider.module.css';

interface SpokeDividerProps {
  /** Optional label rendered after the motif, e.g. "Offers for you" eyebrow */
  align?: 'left' | 'center';
}

/**
 * The wheel hub-and-spokes mark from the Zooli logo, reused as a structural
 * divider. It appears wherever a new shelf of content begins, the same way
 * the line–dot–line rule sits under "Veera Smart Services" on the mark.
 */
export function SpokeDivider({ align = 'left' }: SpokeDividerProps) {
  return (
    <div className={styles.row} data-align={align} aria-hidden="true">
      <span className={styles.line} />
      <svg viewBox="0 0 24 24" className={styles.hub} fill="none">
        <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="12" cy="12" r="2.4" fill="currentColor" />
        <path
          d="M12 2.5v6.4M12 21.5v-6.4M2.5 12h6.4M21.5 12h-6.4M5.5 5.5l4.4 4.4M18.5 18.5l-4.4-4.4M5.5 18.5l4.4-4.4M18.5 5.5l-4.4 4.4"
          stroke="currentColor"
          strokeWidth="1.2"
        />
      </svg>
      <span className={styles.line} />
    </div>
  );
}
