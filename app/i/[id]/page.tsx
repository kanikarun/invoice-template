import { redirect, RedirectType } from 'next/navigation';

import { ROUTES } from '@/config/routes';
import { encode_invoice } from '@/utils/short-uuid';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function Page(props: PageProps) {
  const params = await props.params;
  return redirect(ROUTES.INVOICES$(encode_invoice(params.id)), RedirectType.replace);
}
