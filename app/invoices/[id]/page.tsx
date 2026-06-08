import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { siteConfig } from '@/config/site';
import { env } from '@/env';
import { getColor } from '@/lib/color';
import { getInvoice, getUser } from '@/lib/directus';
import { InvoiceForm } from '@/modules/invoice/components';
import { ThemeProvider } from '@/providers/theme-provider';
import { DirectusFiles, Merchants, MerchantsTranslations } from '@/types/directus';
import { getDirectusImage } from '@/utils/image';
import { decode_invoice } from '@/utils/short-uuid';
import { getTranslation } from '@/utils/translation';

type PageProps = Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ locale?: Locale; color: string; __token?: string }>;
}>;

export const runtime = 'edge';

export const revalidate = 0;

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const data = await getInvoice(decode_invoice(params.id));

  if (!data) {
    return {};
  }

  const { merchant: m } = data;
  const mTran = getTranslation(m.translations as MerchantsTranslations[], 'en');
  const mName = mTran?.title || m.translations[0]?.title || m.translations[1]?.title;

  const url = env.NEXT_PUBLIC_SITE_URL;
  const title = `Digital Invoice | ${mName}`;
  const description = 'Your digital invoice, please have a check. Thanks You!';

  const imageUrl = getDirectusImage(m.logo as DirectusFiles) || '';
  return {
    title: {
      absolute: title
    },
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url: `${url}${ROUTES.INVOICES$(params.id)}`,
      images: [imageUrl]
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description,
      images: [imageUrl]
    }
  };
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const headersList = await headers();

  const token = headersList.get('X-Token') || searchParams.__token;
  const { color, locale = 'en' } = searchParams;
  const l = siteConfig.locales.includes(locale) ? locale : 'en';

  const [data, user] = await Promise.all([getInvoice(decode_invoice(params.id)), getUser(token)]);
  if (!data) return notFound();

  const { invoice, merchant: m } = data;
  const palette = getColor(color || m?.color);
  const isAuth = user?.merchants?.some(x => (x.merchants_id as Merchants).id === m.id);

  return (
    <ThemeProvider>
      <InvoiceForm
        locale={l}
        authToken={token}
        hashId={params.id}
        invoice={invoice}
        isAuth={isAuth}
        merchant={m}
        palette={palette}
      />
    </ThemeProvider>
  );
}
