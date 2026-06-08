import './globals.css';

import { NuqsAdapter } from 'nuqs/adapters/next/app';

import { fontSans, fontSansKh } from '@/lib/fonts';

type Props = Readonly<{ children: React.ReactNode; modal: React.ReactNode }>;

export default function RootLayout({ children, modal }: Props) {
  return (
    <html lang="en" className={`${fontSans.variable} ${fontSansKh.variable}`} suppressHydrationWarning>
      <head>
        {/* https://realfavicongenerator.net/ */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#c21011" />
        <meta name="msapplication-TileColor" content="#007e7c" />
        <meta name="theme-color" content="#ffffff" />
      </head>
      <body suppressHydrationWarning>
        <NuqsAdapter>
          <main className="min-h-svh">{children}</main>
          {modal}
        </NuqsAdapter>
      </body>
    </html>
  );
}
