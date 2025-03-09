import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { GoogleAnalytics } from '@next/third-parties/google';

import { siteConfig } from '@/config/site';

import './globals.css';

const GOOGLE_ANALYTICS = process.env.GOOGLE_ANALYTICS || '';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || ''),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: ['nextjs', 'react', 'payment', 'checkout', 'lightning network', 'bitcoin'],
  creator: '',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  icons: {
    icon: '/icon.png',
  },
};

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${inter.variable} antialiased`}>
        <div className='relative overflow-x-hidden flex flex-col w-screen min-h-screen bg-background'>{children}</div>
        <Analytics />
        <GoogleAnalytics gaId={GOOGLE_ANALYTICS} />
      </body>
    </html>
  );
}
