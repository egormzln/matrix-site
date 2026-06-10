import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://egormzln.ru'),
  title: 'Egor Mizyulin',
  description: 'AI · Coding · Startups',
  openGraph: {
    title: 'Welcome Matrix',
    description: 'AI · Coding · Startups',
    url: '/',
    siteName: 'Egor Mizyulin',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Egor Mizyulin — ',
    description: '',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#020804',
};

// Restores the persisted theme before first paint to avoid a color flash.
const themeInitScript = `try{var t=localStorage.getItem("term-theme");if(t==="amber"||t==="green")document.documentElement.dataset.theme=t}catch(e){}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="green"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script, no user input */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
