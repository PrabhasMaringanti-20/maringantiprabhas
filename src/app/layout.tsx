import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import { site } from '@/lib/site';
import './globals.css';

const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  src: [
    { path: './fonts/Satoshi-Regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/Satoshi-Medium.woff2', weight: '500', style: 'normal' },
    { path: './fonts/Satoshi-Bold.woff2', weight: '700', style: 'normal' },
    { path: './fonts/Satoshi-Black.woff2', weight: '900', style: 'normal' },
  ],
});

const clash = localFont({
  variable: '--font-clash',
  display: 'swap',
  src: [
    { path: './fonts/ClashDisplay-Semibold.woff2', weight: '600', style: 'normal' },
    { path: './fonts/ClashDisplay-Bold.woff2', weight: '700', style: 'normal' },
  ],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.role}`,
    template: `%s — ${site.name}`,
  },
  description: site.summary,
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: '/' },
  keywords: [
    'Maringanti Prabhas',
    'Prabhas Maringanti',
    'Software Engineer',
    'Full-stack developer',
    'Backend engineer',
    'Generative AI engineer',
    '.NET Core',
    'ASP.NET Core MVC',
    'React',
    'LangChain',
    'Hyderabad',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.role}`,
    description: site.summary,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${site.name} — ${site.role}`,
    description: site.summary,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fbfcfe' },
    { media: '(prefers-color-scheme: dark)', color: '#0a0e18' },
  ],
};

/**
 * Applies the stored theme before first paint so a returning visitor who chose
 * dark never sees a white flash. Kept tiny and inline on purpose.
 */
const themeInit = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

/** Search engines get the same facts the page states, in machine-readable form. */
const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  jobTitle: site.role,
  description: site.summary,
  email: `mailto:${site.email}`,
  url: site.url,
  sameAs: [site.github, site.linkedin],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Hyderabad',
    addressRegion: 'Telangana',
    addressCountry: 'IN',
  },
  alumniOf: {
    '@type': 'CollegeOrUniversity',
    name: 'Vaagdevi College of Engineering (JNTU)',
  },
  worksFor: {
    '@type': 'Organization',
    name: 'Cognizant Technology Solutions',
  },
  knowsAbout: [
    'Full-stack development',
    'Backend engineering',
    'Generative AI',
    'ASP.NET Core MVC',
    'Entity Framework Core',
    'React',
    'LangChain',
    'PostgreSQL',
    'SQL Server',
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The font variables must live on <html>: Tailwind resolves --font-sans /
    // --font-display at :root, so a variable defined only on <body> would be
    // undefined at that point and the whole family would fall back to system.
    <html lang="en" className={`${satoshi.variable} ${clash.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
