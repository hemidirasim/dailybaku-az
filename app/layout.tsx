import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Xəbər - Azərbaycan Xəbər Portalı',
  description: 'Azərbaycanda və dünyada baş verən son xəbərlər',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az">
      <body className={inter.className}>
        <Header />
        {children}
      </body>
    </html>
  );
}
