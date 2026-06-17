import { NextRequest, NextResponse } from 'next/server';

import { getColor } from '@/lib/color';
import { getInvoice } from '@/lib/directus';
import { createPdf } from '@/lib/pdfmake';
import {
  BoldStripeIntlInvoiceDocument,
  BoldStripeInvoiceDocument,
  BoldStripePictureIntlInvoiceDocument,
  BoldStripePictureInvoiceDocument,
  DefaultInvoiceDocument,
  FoodieIntlInvoiceDocument,
  FoodieInvoiceDocument,
  KhmerTaxInvoiceDocument,
  PictureInvoiceDocument,
  Thermal50EnInvoiceDocument,
  Thermal50InvoiceDocument,
  Thermal50KmInvoiceDocument,
  Thermal80InvoiceDocument,
  ThinStripeIntlInvoiceDocument,
  ThinStripeInvoiceDocument,
  ThinStripePictureIntlInvoiceDocument,
  ThinStripePictureInvoiceDocument} from '@/modules/invoice/documents';
import { InvoiceType } from '@/modules/invoice/hooks/use-invoice';
import { decode_invoice } from '@/utils/short-uuid';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const color = req?.nextUrl?.searchParams.get('color');
  const locale = req?.nextUrl?.searchParams.get('locale');

  const decode_invoice_id = decode_invoice(params.id);
  // eslint-disable-next-line no-console
  console.log('Invoice:', decode_invoice_id);

  const [data] = await Promise.all([
    getInvoice(decode_invoice_id), //
  ]);
  if (!data) return NextResponse.json({ error: 'Invoice not found' }, { status: 400 });

  const { invoice, merchant } = data;
  const palette = getColor(color || merchant.color);
  const Document = getDocument('foodie-intl');
  const doc = await new Document({ invoice, merchant, palette, locale }).getDefinition();
  const buffer = await createPdf(doc);

  const filename = `Invoice-${params.id}.pdf`;
  return new NextResponse(buffer as never, {
    status: 200,
    headers: {
      'X-Accel-Buffering': 'no',
      'Content-Length': buffer.length.toString(),
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`
    }
  });
}

function getDocument(type?: InvoiceType | null) {
  switch (type) {
    case 'thermal':
    case 'thermal-80':
      return Thermal80InvoiceDocument;
    case 'thermal-50':
      return Thermal50InvoiceDocument;
    case 'thermal-50-en':
      return Thermal50EnInvoiceDocument;
    case 'thermal-50-km':
      return Thermal50KmInvoiceDocument;
    case 'picture':
      return PictureInvoiceDocument;
    case 'khmer-tax':
      return KhmerTaxInvoiceDocument;
    case 'bold-stripe':
      return BoldStripeInvoiceDocument;
    case 'bold-stripe-intl':
      return BoldStripeIntlInvoiceDocument;
    case 'bold-stripe-picture':
      return BoldStripePictureInvoiceDocument;
    case 'bold-stripe-picture-intl':
      return BoldStripePictureIntlInvoiceDocument;
    case 'thin-stripe':
      return ThinStripeInvoiceDocument;
    case 'thin-stripe-intl':
      return ThinStripeIntlInvoiceDocument;
    case 'thin-stripe-picture':
      return ThinStripePictureInvoiceDocument;
    case 'thin-stripe-picture-intl':
      return ThinStripePictureIntlInvoiceDocument;
    case 'foodie-intl':
      return FoodieIntlInvoiceDocument;
    case 'foodie':
      return FoodieInvoiceDocument;
    case 'default':
    default:
      return DefaultInvoiceDocument;
  }
}
