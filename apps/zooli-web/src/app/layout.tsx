import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/lib/auth/AuthProvider';

/**
 * Google Fonts are loaded via <link> tags so next/font's build-time fetch
 * doesn't block CI / sandbox environments that lack outbound internet access.
 * The CSS variables --font-baloo and --font-manrope are declared in globals.css
 * and consumed throughout the design system.
 */
export const metadata: Metadata = {
  title: 'Zooli — One trust, every need',
  description:
    'Food, grocery, rides, home services, parcels, tuition, stays and more — all on Zooli, by Veera Smart Services India Pvt Ltd.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Manrope:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
