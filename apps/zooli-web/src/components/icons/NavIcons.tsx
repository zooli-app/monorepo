interface P { className?: string }
const b = { viewBox: '0 0 24 24', fill: 'none', xmlns: 'http://www.w3.org/2000/svg', 'aria-hidden': true } as const;

export function HomeIcon({ className }: P) {
  return <svg {...b} className={className}><path d="M3 12L12 3l9 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 12v9h18v-9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
export function GridIcon({ className }: P) {
  return <svg {...b} className={className}><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="2"/></svg>;
}
export function OrdersIcon({ className }: P) {
  return <svg {...b} className={className}><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" strokeWidth="2"/><path d="M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
export function HeartIcon({ className }: P) {
  return <svg {...b} className={className}><path d="M6 2 3.5 6H2a1 1 0 0 0-1 1l.5 12a1 1 0 0 0 1 1h19a1 1 0 0 0 1-1L22 7a1 1 0 0 0-1-1h-1.5L17 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/><path d="M3 7h18" stroke="currentColor" strokeWidth="2"/><path d="M12 12l-2.5 2.5L12 17l2.5-2.5L12 12Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/></svg>;
}
export function UserNavIcon({ className }: P) {
  return <svg {...b} className={className}><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>;
}
