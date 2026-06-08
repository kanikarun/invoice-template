import type { Content, ContentColumns, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

export class Thermal80InvoiceDocument extends BaseInvoiceDocument {
  private readonly TABLE_SLIDE = 4;

  private readonly defaultStyle: Style = {
    color: '#222',
    font: 'Khmer',
    fontSize: 7.5
  };

  private cutoff(): Content {
    return {
      margin: [0, 2, 0, 10],
      canvas: [{ type: 'rect', x: 0, y: 0, w: 205, h: 0.5, color: '#000000' }]
    };
  }

  private header(): Content {
    const image: TableCell = { width: 30, height: 30, image: 'LOGO', rowSpan: 2 };
    const merchant: Content = [{ text: this.merchant_name || '', fontSize: 10, alignment: 'center' }];
    const title: Content = { text: 'វិក្កយបត្រ / INVOICE', alignment: 'center', bold: true, decoration: 'underline' };
    const header = htmlToPdfmakeText(this.data.merchant.invoice_header);

    if (this.merchant_telephone) {
      header.push({ text: `លេខទូរស័ព្ទ: ${this.merchant_telephone}`, alignment: 'center', fontSize: 6 });
    }

    return {
      layout: 'noBorders',
      marginBottom: 4,
      table: {
        widths: ['18%', '*', '18%'],
        body: [
          [image, merchant, ''],
          ['', title, ''],
          [{ colSpan: 3, stack: header, alignment: 'center', fontSize: 6 }, '', '']
        ]
      }
    };
  }

  private footer(): Content {
    const invoice_note = htmlToPdfmakeText(this.data.merchant.invoice_note);
    const payment_note = htmlToPdfmakeText(this.data.merchant.payment_note);

    return [
      { stack: invoice_note, marginTop: 3, alignment: 'center' },
      { stack: payment_note, marginTop: 3, alignment: 'center' },
      { image: 'KHQR', alignment: 'center', fit: [180, 90], marginTop: 3 }
    ];
  }

  private info(): Content {
    const { date: invoice_date, invoice_no } = this.data.invoice || {};
    const { fullname, phone: _phone, tin, address } = this.getCustomer();
    const phone = `លេខទូរស័ព្ទ៖ ${_phone}`;
    const invoice = `វិក្កយបត្រ៖ ${invoice_no ?? ''}`;
    const date = `កាលបរិច្ឆេទ៖ ${getDate(invoice_date)}`;

    const content: Content = [
      {
        columns: [
          {
            width: '*',
            stack: [{ text: ['អតិថិជន៖ ', { text: fullname }] }, phone]
          },
          {
            width: '45%',
            alignment: 'right',
            stack: [invoice, date]
          }
        ]
      }
    ];

    if (tin) {
      content.push(`លេខ អ.ត.ប៖ ${tin}`);
    }

    if (address) {
      content.push(`អាស័យដ្ឋាន៖ ${address.replaceAll('\n', ' ')}`);
    }

    return content;
  }

  private table(): Content {
    const {
      menus,
      total_price,
      discount,
      discount_price,
      discount_type,
      delivery_price,
      deposit,
      deposit_type,
      deposit_price,
      exchange_rate,
      tax_percentage,
      tax_price,
      sub_total
    } = this.data.invoice || {};

    const widths = ['auto', '*', 'auto', 'auto', 26, 'auto'];
    const header_row: TableCell[] = [
      this.table_header_cell('No', 'ល.រ'),
      this.table_header_cell('Item', 'ឈ្មោះទំនិញ'),
      this.table_header_cell('Qty', 'ចំនួន'),
      this.table_header_cell('Price', 'តម្លៃ'),
      this.table_header_cell('Discount', 'បញ្ចុះតម្លៃ'),
      this.table_header_cell('Amount', 'សរុប')
    ];

    if (this.no_item_discount) {
      widths.splice(this.TABLE_SLIDE, 1);
      header_row.splice(this.TABLE_SLIDE, 1);
    }

    const total_text = 'សរុប / Total Price';
    const _discount = discount_type === 'percentage' && Number(discount) ? `(${Number(discount)}%)` : '';
    const discount_text = `បញ្ចុះតម្លៃ / Discount ${_discount}`;
    const _deposit = deposit_type === 'percentage' && Number(deposit) ? `(${Number(deposit)}%)` : '';
    const deposit_text = `ប្រាក់កក់ / Deposit ${_deposit}`;
    const delivery_text = 'ថ្លៃដឹកជញ្ជូន / Delivery Fee';
    const tax_text = `អាករតម្លៃបន្ថែម / VAT (${Number(tax_percentage)}%)`;
    const subtotal_text = this.no_deposit_price ? 'សរុបរួម / Sub Total' : 'ប្រាក់ត្រូវបង់ / Balance Due';
    const exchange_rate_text = `សរុបរួមរៀល / In Riel (៛ ${this.currency_format(Number(exchange_rate), 'KHR')})`;
    const sub_total_in_riel = Number(sub_total) * Number(exchange_rate);

    const total_rows = [
      this.price_row({ title: total_text, value: total_price }),
      this.no_discount_price ? null : this.price_row({ title: discount_text, value: -(discount_price || 0) }),
      this.no_delivery_price ? null : this.price_row({ title: delivery_text, value: delivery_price }),
      this.no_tax_price ? null : this.price_row({ title: tax_text, value: tax_price }),
      this.no_deposit_price ? null : this.price_row({ title: deposit_text, value: deposit_price || 0 }),
      this.no_sub_total ? null : this.price_row({ title: subtotal_text, value: sub_total, bold: true }),
      this.no_exchange_rate
        ? null
        : this.price_row({
            title: exchange_rate_text,
            value: sub_total_in_riel,
            currency: 'KHR',
            symbol: '៛',
            bold: true
          }),
      this.price_note()
    ].filter(x => x);

    return {
      marginTop: 4,
      marginBottom: 3,
      table: {
        widths,
        body: [
          header_row,

          ...(menus || []).map((x, i) => {
            const { menus_id, unit_price, qty, total_price, discount, discount_type, merchant_uom_id } =
              (x as InvoicesMenus) || {};

            const name = this.getMenuName(menus_id as Menus);
            const discount_symbol = discount_type === 'percentage' ? '%' : undefined;
            const qty_text = textToPdfmakeText(`${this.qty_format(qty)} ${merchant_uom_id?.name || ''}`.trim());

            const row = [
              { text: i + 1, alignment: 'center' },
              { text: name },
              { text: qty_text, alignment: 'center' },
              this.price_cell(unit_price),
              this.price_cell(discount, { symbol: discount_symbol }),
              this.price_cell(total_price)
            ];

            if (this.no_item_discount) row.splice(this.TABLE_SLIDE, 1);

            return row;
          }),

          ...(total_rows as TableCell[][])
        ]
      }
    } as Content;
  }

  private table_header_cell(en_title: string, kh_title: string): Content {
    return [
      { text: kh_title, alignment: 'center', fontSize: 6.5, bold: true },
      { text: en_title, alignment: 'center', fontSize: 6 }
    ];
  }

  private price_cell(value?: number | null, opt?: { symbol?: string; currency?: string }): ContentColumns {
    const { currency, symbol } = opt || {};
    return {
      columns: [
        {
          text: symbol ?? textToPdfmakeText(this.currency.symbol),
          width: 'auto',
          marginTop: -0.5,
          marginRight: 1
        },
        {
          text: this.currency_format(value, currency),
          width: '*',
          alignment: 'right'
        }
      ]
    };
  }

  private price_row(opt: PriceRow): TableCell[] {
    const { title, value, bold, currency, symbol } = opt;

    const text_cell: TableCell = { text: title || '', bold };
    const price_cell: TableCell = { ...this.price_cell(value, { currency, symbol }), bold };

    if (this.no_item_discount) {
      return [
        { colSpan: 4, ...text_cell }, // 1. No
        '', // 2. Name
        '', // 3. Qty
        '', // 4. Unit price
        price_cell // 5. Amount
      ];
    }

    return [
      { colSpan: 5, ...text_cell }, // 1. No
      '', // 2. Name
      '', // 3. Qty
      '', // 4. Unit price
      '', // 5. Discount
      price_cell // 6. Amount
    ];
  }

  private price_note(): TableCell[] | null {
    if (!this.data.invoice.note) return null;

    const note = htmlToPdfmakeText(`<b>ចំណាំ / Note: </b><br/>${this.data.invoice.note}`);
    if (this.no_item_discount) {
      return [
        { colSpan: 5, fontSize: 7, stack: note }, // 1. No
        '', // 2. Name
        '', // 3. Qty
        '', // 4. Unit price
        '' // 5. Amount
      ];
    }

    return [
      { colSpan: 6, fontSize: 7, stack: note }, // 1. No
      '', // 2. Name
      '', // 3. Qty
      '', // 4. Unit price
      '', // 5. Discount
      '' // 6. Amount
    ];
  }

  async getDefinition(): Promise<TDocumentDefinitions> {
    // this.cutoff()
    const contents: Content = [this.header(), this.info(), this.table(), this.footer()];

    const [LOGO, KHQR] = await Promise.all([getImageBase64(this.merchant_logo), getImageBase64(this.merchant_khqr)]);

    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: { LOGO, KHQR },
      pageMargins: [10, 8],
      pageOrientation: 'portrait',
      // https://www.conversionunites.com/converter-mm-to-points
      pageSize: {
        width: 226, // 80mm
        height: 'auto'
      }
    };
  }
}

interface PriceRow {
  title?: string;
  value?: number | null;
  currency?: string;
  symbol?: string;
  bold?: boolean;
}
