/* eslint-disable no-console */
'use server';

import {
  createDirectus,
  createItem,
  customEndpoint,
  readItem,
  readItems,
  readMe,
  rest,
  staticToken,
  updateItem,
  withOptions
} from '@directus/sdk';
import qs from 'qs';
import sanitizeHtml from 'sanitize-html';

import { siteConfig } from '@/config/site';
import { env } from '@/env';
import {
  CustomDirectusTypes,
  Customers,
  Invoices,
  MenuCategories,
  MenuOrders,
  Menus,
  Merchants
} from '@/types/directus';
import { decode, encode } from '@/utils/short-uuid';

const url = env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';
const client = createDirectus<CustomDirectusTypes>(url)
  .with(staticToken(env.NEXT_DIRECTUS_TOKEN))
  .with(rest({ onRequest: req => ({ cache: 'force-cache', next: { revalidate: 120 }, ...req }) }));

const noCacheRequestTransformer = (req: RequestInit): Partial<RequestInit> => ({
  ...req,
  cache: 'no-store',
  next: { revalidate: 0 },
  headers: { ...req.headers, 'Cache-Control': 'no-store' }
});

const IMAGE_FIELDS = ['id', 'filename_disk', 'storage'] as const;

export async function checkEnableMerchantPaymentMethod(merchant_id: string): Promise<boolean> {
  try {
    const mpm = await client.request(
      readItems('merchant_payment_methods', {
        filter: { merchant_id: { _eq: merchant_id }, status: { _eq: 'published' } },
        limit: 1,
        fields: ['merchant_id', 'payway_enabled']
      })
    );
    if (!mpm.length) return false;

    return mpm.at(0)?.payway_enabled || false;
  } catch (error) {
    console.error('Check Enable Menu Order:', error);
    return false;
  }
}

export async function checkUserPhone(phone: string) {
  const path = `/custom-endpoints/auth/check-phone`;
  const data = await client.request(
    customEndpoint<{ exist: boolean }>({
      method: 'POST',
      path,
      body: JSON.stringify({ phone })
    })
  );
  return data.exist;
}

export async function createTransactionOnWeb(body: CreateTransactionOnWebReq) {
  const path = `/custom-endpoints/orders/web`;
  return client.request(customEndpoint<Record<string, string>>({ method: 'POST', path, body: JSON.stringify(body) }));
}

export async function createMenuOrder(body: CreateMenuOrderRequest) {
  try {
    // Decode menu_id before send to server
    body.items = body.items.map(x => ({ ...x, menu_id: decode(x.menu_id) }));
    const path = `/custom-endpoints/storefront/menu-orders`;
    const data = await client.request(
      customEndpoint<Record<string, string>>({ method: 'POST', path, body: JSON.stringify(body) })
    );
    return { error: false, data };
  } catch (e) {
    return { error: true, message: (e as any).errors.message };
  }
}

export async function getCategories(merchant_id: string) {
  try {
    return (await client.request(
      readItems('menu_categories', {
        limit: 250,
        fields: ['id', { translations: ['*'] }],
        filter: {
          merchant_id: { _eq: merchant_id as never },
          status: { _eq: 'published' }
        }
      })
    )) as unknown as MenuCategories[];
  } catch (error) {
    console.error('Get Categories:', error);
    return [];
  }
}

export async function getInvoice(id: string) {
  try {
    const invoice = await client.request(
      withOptions(
        readItem('invoices', id, {
          fields: [
            '*',
            {
              menus: [
                '*',
                {
                  menus_id: [{ image: IMAGE_FIELDS, translations: ['name', 'languages_code'] }],
                  merchant_uom_id: ['name']
                }
              ],
              customer: ['id', 'fullname', 'phone', 'tin', 'address']
            }
          ]
        }),
        noCacheRequestTransformer
      )
    );

    if (!invoice) return null;

    const merchant = await getMerchantForInvoiceOrReceipt({ id: invoice.merchant_id as unknown as string });

    return { invoice, merchant } as unknown as { invoice: Invoices; merchant: Merchants };
  } catch (error) {
    console.error('Get Invoice:', error);
    return null;
  }
}

export async function getInvoices(opt: GetInvoicesRequest): Promise<GetInvoicesResult> {
  try {
    const { token, from, to } = opt;
    if (!token) return null;

    const filter = {
      status: { _neq: 'archived' },
      date: { _between: [from, to] } as never
    };

    const data = (await client.request(
      withOptions(
        readItems('invoices', {
          limit: 10000,
          filter,
          sort: ['-date', 'invoice_no'],
          fields: [
            'currency',
            'date',
            'delivery_price',
            'discount',
            'discount_price',
            'discount_type',
            'deposit',
            'deposit_type',
            'deposit_price',
            'invoice_no',
            'invoice_status',
            'note',
            'sub_total',
            'total_price',
            { customer: ['id', 'fullname', 'phone'] }
          ]
        }),
        { headers: { Authorization: `Bearer ${token}` } }
      )
    )) as unknown as Invoices[];

    return { data, total: groupTotalInvoice(data) };
  } catch (error) {
    console.error('Get Invoices:', error);
    return null;
  }
}

export async function getMenuInvoices(opt: GetMenuInvoicesRequest): Promise<GetInvoicesResult> {
  try {
    const { token, from, to, menu_id } = opt;
    if (!token) return null;

    type MenuInvoice = {
      id: string;
      customer: Customers;
      invoice_status: string;
      invoice_no: string;
      date: string;
      currency: string;
      qty: string;
      total_price: string;
    };

    const query = qs.stringify({ from, to, limit: 10000 }, { addQueryPrefix: true });
    const path = `/custom-endpoints/menus/${menu_id}/invoices${query}`;
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const result = await client.request(
      withOptions(customEndpoint<MenuInvoice[]>({ method: 'GET', path }), { headers })
    );

    const data = result.map<Invoices>(x => ({
      id: x.id,
      currency: x.currency,
      date: x.date,
      invoice_no: x.invoice_no,
      invoice_status: x.invoice_status,
      total_price: +x.total_price,
      sub_total: +x.total_price,
      delivery_price: 0,
      discount_price: 0,
      deposit_price: 0,
      customer: x.customer as never,
      menus: []
    }));

    return { data, total: groupTotalInvoice(data) };
  } catch (error) {
    console.error('Get Menu Invoices:', error);
    return null;
  }
}

export async function getMenuOrderForReceipt(receipt_code: string, merchant_code: string) {
  try {
    const merchant = await getMerchantForInvoiceOrReceipt({ code: merchant_code });

    const menu_orders = await client.request(
      withOptions(
        readItems('menu_orders', {
          fields: [
            '*',
            { menu_order_items: ['*', { menu_id: ['image', 'code', { translations: ['name', 'languages_code'] }] }] }
          ],
          filter: {
            code: { _eq: receipt_code || '-1' },
            merchant_id: merchant?.id || '-1',
            payment_status: { _eq: 'SUCCESS' }
          },
          limit: 1
        }),
        noCacheRequestTransformer
      )
    );

    if (!menu_orders.length) return null;
    const menu_order = menu_orders[0];

    return { menu_order, merchant } as unknown as { menu_order: MenuOrders; merchant: Merchants };
  } catch (error) {
    console.error('Get Menu Order:', error);
    return null;
  }
}

export async function getMenus(opt: GetMenusOpt) {
  try {
    const { merchant_id, id, ids, menu_categories, notId, limit: _limit, page, withMenuPrice } = opt;
    const filterByIds = ids && Boolean(ids.length) ? { id: { _in: ids } } : {};
    const filterById = id ? { id: { _eq: decode(id) } } : {};
    const filterByNotId = notId ? { id: { _neq: decode(notId) } } : {};
    const filterByCate = menu_categories ? { menu_categories: { menu_categories_id: { _in: menu_categories } } } : {};

    const limit = _limit ?? siteConfig.maxMenuQueryLimit;

    const data = await client.request(
      readItems('menus', {
        fields: [
          'id',
          'code',
          // 'image',
          'price_khr',
          'price_usd',
          'discount_percentage',
          'discount_khr',
          'discount_usd',
          'menu_price_enabled',
          {
            menu_categories: ['*'],
            menu_tag: ['status', 'bg_color', { translations: ['*'] }],
            media: ['*', { directus_files_id: IMAGE_FIELDS }],
            image: IMAGE_FIELDS,
            translations: ['*'],
            ...(withMenuPrice ? { menu_prices: ['id', 'name', 'unit_price', 'discount', 'discount_type'] } : {})
          }
        ],

        deep: {
          ...(withMenuPrice ? { menu_prices: { _filter: { status: { _eq: 'published' } } } } : {})
        } as never,

        filter: {
          ...filterById,
          ...filterByIds,
          ...filterByCate,
          ...filterByNotId,
          merchant_id: { _eq: merchant_id as never },
          status: { _eq: 'published' }
        },
        limit,
        offset: page && page > 1 ? (page - 1) * limit : 0,
        sort: ['sort', 'code']
      })
    );

    return data.map(x => ({ ...x, id: encode(x.id) })) as never as Menus[];
  } catch (error) {
    console.error('Get Menus:', error);
    return [];
  }
}

export async function getMerchantByCode(code: string) {
  try {
    const merchants = await client.request(
      readItems('merchants', {
        filter: { code: { _eq: code }, status: { _eq: 'published' } },
        limit: 1,
        fields: ['*', { translations: ['*'], cover: IMAGE_FIELDS, logo: IMAGE_FIELDS }]
      })
    );
    if (!merchants.length) return null;

    // Sanitize up description HTML
    const m = merchants[0] as unknown as Merchants;
    m.translations = m.translations.map(x => ({ ...x, description: sanitizeHtml(x.description) }));

    return m;
  } catch (error) {
    console.error('Get Merchant by Code:', error);
    return null;
  }
}

export async function getMerchantByMerchandiseCode(code: string) {
  try {
    const path = `/custom-endpoints/merchants/merchandise?code=${code}`;
    return client.request(customEndpoint<{ code: string }>({ method: 'GET', path }));
  } catch (error) {
    console.error('Get Merchant by merchandise code:', error);
    return null;
  }
}

export async function getMenuOrderByCode(code?: string) {
  try {
    const data = await client.request(
      withOptions(
        readItems('menu_orders', {
          fields: ['id', 'code', 'sub_total', 'date_created', 'payment_status'],
          filter: { code: { _eq: code || '-1' } },
          limit: 1
        }),
        noCacheRequestTransformer
      )
    );
    return data.at(0);
  } catch (error) {
    console.error('Get Menu Order:', error);
    return null;
  }
}

export async function getSliders(merchant_id: string) {
  try {
    return await client.request(
      readItems('sliders', {
        fields: ['id', 'title', { image: IMAGE_FIELDS }],
        filter: {
          merchant_id: { _eq: merchant_id as never },
          status: { _eq: 'published' }
        },
        sort: ['-id']
      })
    );
  } catch (error) {
    console.error('Get Sliders:', error);
    return [];
  }
}

export async function getUser(token?: string | null) {
  try {
    if (!token) return null;

    const user = await client.request(
      withOptions(readMe({ fields: ['id', { merchants: [{ merchants_id: ['id', 'code'] }] }] }), {
        headers: { Authorization: `Bearer ${token}` }
      })
    );
    return user;
  } catch (error) {
    console.error('Get User:', error);
    return null;
  }
}

/**
 * @deprecated
 */
export async function getLeadBySenderId(sender_id: string) {
  try {
    const leads = await client.request(
      readItems('leads', {
        limit: 1,
        fields: ['id', 'name'],
        filter: { sender_id: { _eq: sender_id } }
      })
    );
    return leads.at(0);
  } catch (error) {
    console.error('Get Lead:', error);
    return null;
  }
}

export async function createLead(opt: CreateLeadOpt) {
  try {
    await client.request(createItem('leads', opt));
  } catch (error) {
    console.error('Create Lead:', error);
    throw error;
  }
}

export async function updateInvoiceStatus(token: string, id: string, invoice_status: InvoiceStatus) {
  try {
    const s: InvoiceStatus[] = ['paid', 'pending'];
    if (!s.includes(invoice_status)) throw new Error('Invalid status');

    return (await client.request(
      withOptions(updateItem('invoices', id, { invoice_status }), {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      })
    )) as Invoices;
  } catch (error) {
    console.error('Upload Invoice Status:', error);
    throw error;
  }
}

async function getMerchantForInvoiceOrReceipt(opt: { id?: string; code?: string }) {
  const { id, code } = opt;
  const filterById = id ? { id: { _eq: id } } : {};
  const filterByCode = code ? { code: { _eq: code } } : {};

  const data = await client.request(
    withOptions(
      readItems('merchants', {
        limit: 1,
        filter: {
          ...filterById,
          ...filterByCode
        },
        fields: [
          'id',
          'color',
          'telephone',
          'invoice_header',
          'invoice_note',
          'payment_note',
          'invoice_tin',
          'show_signature',
          { translations: ['*'], logo: IMAGE_FIELDS, signature_image: IMAGE_FIELDS, khqr_image: IMAGE_FIELDS }
        ]
      }),
      noCacheRequestTransformer
    )
  );

  return data.at(0);
}

function groupTotalInvoice(data: Invoices[]) {
  const group = data.reduce(
    (pre, cur) => {
      if (!cur.currency) return pre;

      const c = cur.currency.toLowerCase();
      if (!pre[c]) {
        pre[c] = { currency: c, total_price: 0, discount_price: 0, delivery_price: 0, deposit_price: 0, sub_total: 0 };
      }

      pre[c].total_price += Number(cur.total_price ?? 0);
      pre[c].discount_price += Number(cur.discount_price ?? 0);
      pre[c].delivery_price += Number(cur.delivery_price ?? 0);
      pre[c].deposit_price += Number(cur.deposit_price ?? 0);
      pre[c].sub_total += Number(cur.sub_total ?? 0);
      return pre;
    },
    {} as Record<string, PriceResult>
  );

  return Object.entries(group).map(([, data]) => data);
}

interface CreateTransactionOnWebReq {
  phone: string;
  plan: 'monthly' | 'yearly';
  coupon_code?: string;
  app_type: 'invoice' | 'menu';
  payment_method: 'PAYWAY' | 'ABA KHQR';
  success_url: string;
}

interface CreateMenuOrderRequest {
  merchant_id: string;
  payment_method: string;
  // ----
  customer_name: string;
  customer_phone: string;
  customer_address?: string | null;
  customer_note?: string | null;
  // ----
  items: {
    menu_id: string; // Encode Menu Id
    menu_price_id: string; // UUID
    qty: number;
  }[];
}

export interface GetMenusOpt {
  merchant_id: string;
  id?: string;
  ids?: string[];
  notId?: string;
  menu_categories?: string[];
  // ---
  limit?: number;
  page?: number;
  withMenuPrice?: boolean;
}

interface GetInvoicesRequest {
  from: string;
  to: string;
  token?: string;
}

interface GetMenuInvoicesRequest extends GetInvoicesRequest {
  menu_id?: string | null;
}

interface CreateLeadOpt {
  sender_id?: string;
  name?: string;
  phone?: string;
}

export type GetInvoicesResult = {
  data: Invoices[];
  total: PriceResult[];
} | null;

interface PriceResult {
  currency: string;
  total_price: number;
  discount_price: number;
  deposit_price: number;
  delivery_price: number;
  sub_total: number;
}
