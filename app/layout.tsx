import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az'),
  title: {
    default: 'Daily Baku - Azərbaycan Xəbər Portalı',
    template: '%s | Daily Baku',
  },
  description: 'Azərbaycanda və dünyada baş verən son xəbərlər, analitik materiallar və aktuallıqla sizə çatırıq. Gündəlik xəbərlər, siyasət, iqtisadiyyat, idman, texnologiya və daha çox.',
  keywords: ['xəbər', 'Azərbaycan', 'gündəlik xəbərlər', 'siyasət', 'iqtisadiyyat', 'idman', 'texnologiya', 'news', 'Azerbaijan', 'daily news'],
  authors: [{ name: 'Daily Baku' }],
  creator: 'Daily Baku',
  publisher: 'Daily Baku',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'az_AZ',
    alternateLocale: ['en_US'],
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az',
    siteName: 'Daily Baku',
    title: 'Daily Baku - Azərbaycan Xəbər Portalı',
    description: 'Azərbaycanda və dünyada baş verən son xəbərlər, analitik materiallar və aktuallıqla sizə çatırıq.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Daily Baku',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Daily Baku - Azərbaycan Xəbər Portalı',
    description: 'Azərbaycanda və dünyada baş verən son xəbərlər',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az',
    languages: {
      'az-AZ': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az'}/az`,
      'en-US': `${process.env.NEXT_PUBLIC_SITE_URL || 'https://dailybaku.az'}/en`,
    },
  },
  verification: {
    // Google Search Console və digər verification kodları buraya əlavə edilə bilər
    // google: 'verification-code',
    // yandex: 'verification-code',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" suppressHydrationWarning>
      <head>
        <link href="https://fonts.cdnfonts.com/css/chomsky" rel="stylesheet" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
