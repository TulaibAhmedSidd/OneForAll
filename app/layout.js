import { Bricolage_Grotesque, Figtree, JetBrains_Mono } from 'next/font/google';
import { ToastContainer } from 'react-toastify';
import ServiceWorker from '@/components/ServiceWorker';
import './globals.css';

const display = Bricolage_Grotesque({ subsets: ['latin'], variable: '--font-display', weight: ['500', '700', '800'] });
const body = Figtree({ subsets: ['latin'], variable: '--font-body' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['400', '600'] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'One For All — Rs 1 tickets, real prizes', template: '%s · One For All' },
  description: 'Buy a Rs 1, Rs 5 or Rs 10 ticket, and win phones, gadgets and cash in draws anyone can verify.',
  applicationName: 'One For All',
  icons: { icon: [{ url: '/icons/192', type: 'image/png' }], apple: '/icons/180' },
  appleWebApp: { capable: true, title: 'One For All', statusBarStyle: 'black-translucent' },
  openGraph: { title: 'One For All', description: 'Small tickets. Real prizes. Draws you can check yourself.', type: 'website' },
};

export const viewport = {
  themeColor: '#0E3B2E',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        {children}
        <ToastContainer position="top-center" autoClose={3500} hideProgressBar newestOnTop theme="colored" />
        <ServiceWorker />
      </body>
    </html>
  );
}
