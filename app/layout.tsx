import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono, Space_Grotesk } from 'next/font/google';
import CustomCursor from '@/components/CustomCursor';
import Navbar from '@/components/Navbar';
import Preloader from '@/components/Preloader';
import SmoothScroll from '@/components/SmoothScroll';
import { brand } from '@/lib/content';
import './globals.css';

const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space', display: 'swap' });
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains', display: 'swap' });

const title = 'REUDE Technologies — One Drone. Endless Possibilities.';
const description =
  '1 drone, multiple functions: REUDE Technologies builds next-gen industrial UAVs for logistics, inspection, defense, agriculture and renewable energy. Chennai, Tamil Nadu.';

export const metadata: Metadata = {
  metadataBase: new URL(brand.siteUrl),
  title,
  description,
  applicationName: 'REUDE Technologies',
  keywords: ['REUDE', 'industrial drone', 'UAV', 'Stingraey', 'GAPs', 'CompliQ', 'DynoX', 'RotriX', 'drone logistics', 'drone inspection', 'Chennai'],
  openGraph: {
    title,
    description,
    type: 'website',
    siteName: 'REUDE Technologies',
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'REUDE Technologies' }],
  },
  twitter: { card: 'summary_large_image', title, description, images: ['/og.jpg'] },
};

export const viewport: Viewport = {
  themeColor: '#0a0a0a',
  width: 'device-width',
  initialScale: 1,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'REUDE Technologies',
  url: brand.siteUrl,
  logo: `${brand.siteUrl}/logos/reude-stacked.webp`,
  description,
  email: brand.businessEmail,
  telephone: brand.phone,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'No.1, Nehru Street, Vasantham Nagar, Avadi, Poonamallee',
    addressLocality: 'Tiruvallur',
    addressRegion: 'Tamil Nadu',
    postalCode: '600071',
    addressCountry: 'IN',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the preloader / js-class scripts toggle classes on <html> before React hydrates.
    <html lang="en" className={`${space.variable} ${inter.variable} ${mono.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>
        {/* Marks the page as scripted so [data-reveal] content only hides when JavaScript will reveal it. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
        <noscript>
          <style>{'.preloader{display:none!important}html.is-loading{overflow:auto!important}'}</style>
        </noscript>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <a
          href="#products"
          className="fixed left-3 top-3 z-[150] -translate-y-20 rounded-full bg-white px-4 py-2 text-sm font-semibold text-ink focus:translate-y-0"
        >
          Skip to content
        </a>
        <Preloader />
        <CustomCursor />
        <SmoothScroll>
          <Navbar />
          <main>{children}</main>
        </SmoothScroll>
      </body>
    </html>
  );
}
