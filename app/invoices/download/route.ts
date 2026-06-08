/* eslint-disable no-console */
import { NextRequest, NextResponse } from 'next/server';
import * as v from 'valibot';

import { getInvoices, getMenuInvoices, getMenus, getMerchantByCode, getUser } from '@/lib/directus';
import { createPdf2 } from '@/lib/pdfmake';
import { InvoiceReportDocument } from '@/modules/invoice/documents';
import { Merchants } from '@/types/directus';
import dayjs from '@/utils/dayjs';
import { encode } from '@/utils/short-uuid';

type Input = v.InferInput<typeof Schema>;

const Schema = v.object({
  token: v.string('Token is required'),
  type: v.picklist(['pdf', 'excel'], "Type must be 'pdf' or 'excel'"),
  preset: v.picklist(['today', 'this-month', 'last-month', '3-months', '6-months'], 'Please choose one of the preset'),
  menu_id: v.optional(v.nullable(v.string('Menu id must be string')))
});

export async function GET(req: NextRequest) {
  // Validate query string
  const r = validate(req);
  if (!r.success) return NextResponse.json({ error: r.issues[0].message }, { status: 422 });

  // Validate user
  const { token, preset, menu_id } = r.output;
  const user = await getUser(token);
  if (!user) return NextResponse.json({ error: 'Unknown user' }, { status: 400 });

  // Validate preset & merchant
  const p = checkPreset(preset);
  const args = { menu_id, token, from: p.from.toISOString(), to: p.to.toISOString() };
  const [inv, merchant] = await Promise.all([
    menu_id ? getMenuInvoices(args) : getInvoices(args),
    getMerchantByCode((user?.merchants?.at(0)?.merchants_id as Merchants)?.code || '-1')
  ]);

  if (!merchant) return NextResponse.json({ error: 'Merchant not found' }, { status: 400 });

  // Prepare download file
  const f = p.from.format('YYYYMMDD');
  const t = p.to.format('YYYYMMDD');
  const filename = `invoice_reports_${f}_${t}`;
  const menu_name = await getMenuName(merchant.id, menu_id);

  console.log('--preset--', preset, inv?.data.length);
  const doc = await new InvoiceReportDocument(merchant, inv, { ...p, menu_name }).getDefinition();
  console.log('--create--');
  const stream = await createPdf2(doc);
  console.log('--stream--');
  return new NextResponse(stream, {
    status: 200,
    headers: {
      // 'Content-Length': buffer.length.toString(),
      'X-Accel-Buffering': 'no',
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}.pdf"`,
      'Content-Encoding': 'identity' // Sent with no compression
    }
  });
}

function validate(req: NextRequest) {
  const sp = req?.nextUrl?.searchParams;
  return v.safeParse(Schema, {
    token: req.headers.get('X-Token') || sp.get('__token'),
    type: sp.get('type'), // pdf, excel
    preset: sp.get('preset'),
    menu_id: sp.get('menu_id')
  });
}

function checkPreset(preset: Input['preset']) {
  let from: dayjs.Dayjs;
  let to: dayjs.Dayjs;

  const day = dayjs().tz('Asia/Phnom_Penh');
  switch (preset) {
    case 'this-month': {
      from = day.startOf('month');
      to = day.endOf('day');
      break;
    }
    case 'last-month': {
      from = day.subtract(1, 'month').startOf('month');
      to = day.subtract(1, 'month').endOf('month');
      break;
    }
    case '3-months': {
      from = day.subtract(2, 'month').startOf('month');
      to = day.endOf('day');
      break;
    }
    case '6-months': {
      from = day.subtract(5, 'month').startOf('month');
      to = day.endOf('day');
      break;
    }
    case 'today':
    default: {
      from = day.startOf('day');
      to = day.endOf('day');
      break;
    }
  }

  return { from, to };
}

async function getMenuName(merchant_id: string, menu_id?: string | null) {
  const menu = menu_id ? await getMenus({ merchant_id, id: encode(menu_id), limit: 1 }).then(x => x[0]) : null;
  return menu?.translations[0]?.name || menu?.translations[1]?.name || menu?.translations[2]?.name;
}
