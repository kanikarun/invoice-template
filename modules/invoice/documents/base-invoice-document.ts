import { currencies as _currencies, Currency } from 'currencies.json';
import type { CanvasRect, Content, Position } from 'pdfmake/interfaces';

import { siteConfig } from '@/config/site';
import type { PaletteColor } from '@/lib/color';
import { textToPdfmakeText } from '@/lib/pdfmake';
import type {
  Customers,
  DirectusFiles,
  Invoices,
  InvoicesMenus,
  Menus,
  Merchants,
  MerchantsTranslations,
} from '@/types/directus';
import { getDirectusImage } from '@/utils/image';
import { getTranslation } from '@/utils/translation';

const CURRENCY = _currencies.reduce<Record<string, Currency>>((acc, cur) => ({ ...acc, [cur.code]: cur }), {});

const USDFormat = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

const QTYFormat = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  minimumFractionDigits: 0,
  maximumFractionDigits: 3
});

const KHRFormat = new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 0 });

export interface BaseInvoiceDocumentData {
  invoice: Invoices;
  merchant: Merchants;
  palette?: PaletteColor;
  locale?: string | null;
}

export class BaseInvoiceDocument {
  private readonly _currency: string;

  constructor(protected data: BaseInvoiceDocumentData) {
    this._currency = (this.data.invoice.currency || 'usd').toLowerCase();
  }

  protected get show_signature() {
    return Boolean(this.data.merchant.show_signature); // this.data.merchant.signature_image;
  }

  protected get background_color() {
    return this.data.palette?.colors?.[200] || '#DDDDDD';
  }

  protected get border_color() {
    return this.data.palette?.colors?.[600] || 'black';
  }

  protected get dark_color() {
    return this.data.palette?.colors?.[700] || 'black';
  }

  protected get text_color() {
    return this.data.palette?.colors?.[600] || 'black';
  }

  protected get currency() {
    const c = CURRENCY[this._currency.toUpperCase()];
    return { symbol: c?.symbolNative || '' };
  }

  protected currency_format(val?: number | null, currency?: string | null) {
    return currencyFormat(currency ?? this._currency, val);
  }

  protected qty_format(val?: string | number | null) {
    return QTYFormat.format(+(val || 0));
  }

  protected get merchant_name() {
    const t = this.data.merchant.translations;
    const l = (this.data.locale || 'en') as Locale;
    const m = getTranslation<MerchantsTranslations>(this.data.merchant.translations, l, 'title');
    return textToPdfmakeText(m?.title || t[0]?.title || t[1]?.title || t[2]?.title);
  }

  protected get merchant_name_km() {
    const title = this.data.merchant.translations.find(x => x.languages_code === 'km')?.title?.trim();
    return textToPdfmakeText(title);
  }

  protected get merchant_logo() {
    return (
      getDirectusImage(this.data.merchant.logo as DirectusFiles, { quality: 75, size: 'xs' }) || siteConfig.Img1pixel
    );
  }

  protected get merchant_khqr() {
    return (
      getDirectusImage(this.data.merchant.khqr_image as DirectusFiles, { quality: 75, size: 'md' }) ||
      siteConfig.Img1pixel
    );
  }

  protected get merchant_signature() {
    return (
      getDirectusImage(this.data.merchant.signature_image as DirectusFiles, { quality: 75, size: 'md' }) ||
      siteConfig.Img1pixel
    );
  }

  protected get merchant_invoice_tin() {
    return this.data.merchant.invoice_tin;
  }

  protected get merchant_telephone() {
    return this.data.merchant.telephone;
  }

  protected get no_exchange_rate() {
    return !Number(this.data.invoice.exchange_rate);
  }

  protected get no_item_discount() {
    return !this.data.invoice.menus.some((x: InvoicesMenus) => Number(x.discount));
  }

  protected get no_discount_price() {
    return !Number(this.data.invoice.discount_price);
  }

  protected get no_delivery_price() {
    return !Number(this.data.invoice.delivery_price);
  }

  protected get no_tax_price() {
    return !Number(this.data.invoice.tax_price);
  }

  protected get no_deposit_price() {
    return !Number(this.data.invoice.deposit_price);
  }

  protected get no_sub_total() {
    return this.no_discount_price && this.no_delivery_price && this.no_tax_price && this.no_deposit_price;
  }

  protected getMenuName({ translations: trans, code }: Menus) {
    const mTran = getTranslation(trans, (this.data.locale || 'en') as Locale);
    const name = mTran?.name || trans[0]?.name || trans[1]?.name || trans[2]?.name || 'Unknown';
    const sku = code ? `(${code})` : '';
    return textToPdfmakeText(`${name} ${sku}`);
  }

  protected getCustomer() {
    const { customer } = this.data.invoice || {};
    const { address, fullname, phone, tin } = (customer || {}) as Customers;
    return {
      address: address || '',
      fullname: textToPdfmakeText(fullname) || '-',
      phone: phone || '-',
      tin: tin || ''
    };
  }

  protected getImageUrl(file: DirectusFiles) {
    return getDirectusImage(file, { width: 128, height: 128, quality: 50, size: 'xs' }) || siteConfig.Img1pixel;
  }

  protected getRoundedEdge(position: Position, canvas: Pick<CanvasRect, 'color' | 'w' | 'h'> ): Content {
    return {
      relativePosition: position,
      canvas: [{
        type: 'rect',
        x: 0,
        y: 0,
        r: 20,
        // lineColor: 'black',
        color: this.border_color,
        ...canvas,
      }]
    }
  }


}


export class BaseInvoiceReportDocument {
  constructor(protected merchant: Merchants) {}

  protected get merchant_name() {
    return textToPdfmakeText(getTranslation(this.merchant.translations, 'en', 'title')?.title);
  }

  protected currency_format(currency?: string | null, val?: number | null) {
    return currencyFormat(currency, val);
  }
}

function currencyFormat(currency?: string | null, val?: number | null) {
  const code = (currency || '').toUpperCase();
  if (code === 'KHR') {
    return KHRFormat.format(val || 0);
  }

  const data = CURRENCY[code];
  if (!data) {
    return USDFormat.format(val || 0);
  }

  return new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: data.decimalDigits,
    maximumFractionDigits: data.decimalDigits
  }).format(val || 0);
}
