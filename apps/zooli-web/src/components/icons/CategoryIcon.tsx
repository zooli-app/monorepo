import type { CategoryIconName } from '@/lib/types';

interface CategoryIconProps {
  name: CategoryIconName;
  className?: string;
}

/**
 * Single-stroke icon set drawn for Zooli so every category tile shares the
 * same line weight, corner radius and viewBox. Swap individual paths here
 * if brand iconography changes — no consumer needs to know the source.
 */
export function CategoryIcon({ name, className }: CategoryIconProps) {
  const props = {
    className,
    viewBox: '0 0 48 48',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': true,
  };

  switch (name) {
    case 'food':
      return (
        <svg {...props}>
          <path
            d="M10 20c0-7.18 6.27-13 14-13s14 5.82 14 13"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M8 20h32l-2.4 17.1a4 4 0 0 1-3.96 3.4H14.36a4 4 0 0 1-3.96-3.4L8 20Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M19 27v6M24 27v6M29 27v6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'grocery':
      return (
        <svg {...props}>
          <path
            d="M14 16h22l-2.7 16.2a3 3 0 0 1-2.96 2.5H17.66a3 3 0 0 1-2.96-2.5L12 12H7"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M18 16a6 6 0 0 1 12 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="19" cy="40" r="2.2" fill="currentColor" />
          <circle cx="29" cy="40" r="2.2" fill="currentColor" />
        </svg>
      );
    case 'rides':
      return (
        <svg {...props}>
          <path
            d="M9 29l3.2-9.6A4 4 0 0 1 16 16.6h16a4 4 0 0 1 3.8 2.74L39 29"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="7" y="29" width="34" height="9" rx="3" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="15" cy="38" r="3" fill="currentColor" />
          <circle cx="33" cy="38" r="3" fill="currentColor" />
          <path d="M13 23h22" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'home-services':
      return (
        <svg {...props}>
          <path
            d="M30 10l8 8-3.2 3.2-8-8 1.8-1.8a2 2 0 0 1 2.83 0Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M28.8 14.4 12 31.2V38h6.8L35.6 21.2" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M9 41l3-3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'house-shifting':
      return (
        <svg {...props}>
          <path d="M6 33V18l9-5 9 5v15" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M6 33h18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="24" y="22" width="16" height="11" rx="1.5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M27 22v-3.5a1.5 1.5 0 0 1 1.5-1.5h6a1.5 1.5 0 0 1 1.5 1.5V22" stroke="currentColor" strokeWidth="2.5" />
          <circle cx="13" cy="36" r="2.4" fill="currentColor" />
          <circle cx="29" cy="36" r="2.4" fill="currentColor" />
          <circle cx="37" cy="36" r="2.4" fill="currentColor" />
        </svg>
      );
    case 'parcel':
      return (
        <svg {...props}>
          <path
            d="M24 6 41 14.5V33.5L24 42 7 33.5V14.5L24 6Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path d="M7 14.5 24 23l17-8.5" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M24 23v19" stroke="currentColor" strokeWidth="2.5" />
          <path d="M16 10.3 33 18.8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'tuition':
      return (
        <svg {...props}>
          <path d="M24 12 4 20l20 8 20-8-20-8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M13 23.5V32c0 2.8 4.9 5 11 5s11-2.2 11-5v-8.5" stroke="currentColor" strokeWidth="2.5" />
          <path d="M40 20v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'hotel':
      return (
        <svg {...props}>
          <path d="M8 41V11a2 2 0 0 1 2-2h18a2 2 0 0 1 2 2v30" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M30 41V21h8a2 2 0 0 1 2 2v18" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M14 15h4M20 15h4M14 22h4M20 22h4M14 29h4M20 29h4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M5 41h38" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M19 41v-7a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v7" stroke="currentColor" strokeWidth="2.5" />
        </svg>
      );
    case 'resort':
      return (
        <svg {...props}>
          <path d="M24 6v10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M24 16c9 0 14 6.2 14 13H10c0-6.8 5-13 14-13Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
          <path d="M4 38c2.6 2.4 5.2 2.4 7.8 0 2.6-2.4 5.2-2.4 7.8 0 2.6 2.4 5.2 2.4 7.8 0 2.6-2.4 5.2-2.4 7.8 0 2.6 2.4 5.2 2.4 7.8 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
