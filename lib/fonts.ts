import { Ubuntu } from 'next/font/google';
import localFont from 'next/font/local';

export const fontSans = Ubuntu({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '700']
});

/**
 * @link https://hyperos.mi.com/font/en/details/khmer/
 */
export const fontSansKh = localFont({
  display: 'swap',
  variable: '--font-sans-kh',
  src: [
    {
      path: '../public/fonts/MiSansKhmer/MiSansKhmer-Bold.woff2',
      weight: '700',
      style: 'normal'
    },
    {
      path: '../public/fonts/MiSansKhmer/MiSansKhmer-Semibold.woff2',
      weight: '600',
      style: 'normal'
    },
    {
      path: '../public/fonts/MiSansKhmer/MiSansKhmer-Demibold.woff2',
      weight: '500',
      style: 'normal'
    },
    {
      path: '../public/fonts/MiSansKhmer/MiSansKhmer-Medium.woff2',
      weight: '400',
      style: 'normal'
    }
  ]
});
