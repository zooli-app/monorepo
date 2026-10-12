import styles from './WheelGraphic.module.css';

/**
 * A large-scale version of the spoke wheel from the Zooli mark. Used once,
 * in the hero, as the page's signature visual moment.
 */
export function WheelGraphic() {
  return (
    <svg viewBox="0 0 440 440" className={styles.wheel} aria-hidden="true">
      <circle cx="220" cy="220" r="180" className={styles.ringOuter} />
      <circle cx="220" cy="220" r="180" className={styles.ringDash} />
      <circle cx="220" cy="220" r="120" className={styles.ringInner} />
      {Array.from({ length: 12 }).map((_, index) => {
        const angle = (index * 30 * Math.PI) / 180;
        const x1 = 220 + Math.cos(angle) * 120;
        const y1 = 220 + Math.sin(angle) * 120;
        const x2 = 220 + Math.cos(angle) * 178;
        const y2 = 220 + Math.sin(angle) * 178;
        return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} className={styles.spoke} />;
      })}
      <circle cx="220" cy="220" r="34" className={styles.hub} />
      <circle cx="220" cy="220" r="10" className={styles.hubDot} />
    </svg>
  );
}
