import type { Content, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

const OFFSET_MT = -0.5;

export class Thermal50EnInvoiceDocument extends BaseInvoiceDocument {
  private readonly defaultStyle: Style = {
    color: '#222',
    font: 'Khmer',
    fontSize: 6.5
  };

  private readonly styles: Record<string, Style> = {
    the_title: { alignment: 'center', fontSize: 7, bold: true, marginBottom: 4 },
    inv_title: { alignment: 'center', fontSize: 6, bold: true, marginBottom: 2, decoration: 'underline' }
  };

  private cutoff(): Content {
    return {
      margin: [0, 2, 0, 10],
      canvas: [{ type: 'rect', x: 0, y: 0, w: 122, h: 0.5, color: '#000000' }]
    };
  }

  private header(): Content {
    const merchant: Content = [{ text: this.merchant_name || '', style: 'the_title' }];
    const title: Content = { text: 'INVOICE', style: 'inv_title' };
    return [merchant, title];
  }

  private footer(): Content {
    const invoice_note = htmlToPdfmakeText(this.data.merchant.invoice_note);
    const payment_note = htmlToPdfmakeText(this.data.merchant.payment_note);

    return [
      { stack: invoice_note, fontSize: 6, marginTop: 3, alignment: 'center' },
      { stack: payment_note, fontSize: 6, marginTop: 3, alignment: 'center' },
      { image: 'KHQR', alignment: 'center', fit: [90, 66], marginTop: 3 }
    ];
  }

  private info(): Content {
    const { date: invoice_date, invoice_no } = this.data.invoice || {};
    const { fullname, phone: _phone, tin: _tin, address: _address } = this.getCustomer();
    const phone = `Phone: ${_phone}`;
    const invoice = `Inv No: ${invoice_no ?? ''}`;
    const date = `Date: ${getDate(invoice_date)}`;
    const tin = _tin ? `VATTIN: ${_tin}` : null;
    const address = _address ? `Address: ${_address.replaceAll('\n', ' ')}` : null;

    const stack = (
      [invoice, date, { text: ['Customer: ', { text: fullname }] }, phone, tin, address] as Content[]
    ).filter(x => x);
    return { marginBottom: 4, stack };
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

    const _discount = discount_type === 'percentage' && Number(discount) ? `(${Number(discount)}%)` : '';
    const total_text = 'Total Price';
    const discount_text = `Discount ${_discount}`;
    const _deposit = deposit_type === 'percentage' && Number(deposit) ? `(${Number(deposit)}%)` : '';
    const deposit_text = `Deposit ${_deposit}`;
    const delivery_text = 'Delivery Fee';
    const tax_text = `VAT (${Number(tax_percentage)}%)`;
    const subtotal_text = this.no_deposit_price ? 'Sub Total' : 'Balance Due';
    const exchange_rate_text = `In Riel`;
    const sub_total_in_riel = Number(sub_total) * Number(exchange_rate);

    const total_rows = [
      this.price_row({ title: total_text, value: total_price, bold: this.no_sub_total ? true : undefined }),
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
          })
    ].filter(x => x);

    const m_len = menus.length;
    const t_len = m_len + total_rows.length;
    return {
      marginBottom: 3,
      layout: {
        paddingLeft: () => 0,
        paddingRight: () => 0,
        vLineWidth: () => 0,
        hLineWidth: i => (isDashLine(i, m_len, t_len) ? 0.5 : 0)
        // hLineStyle: i => (isDashLine(i, m_len, t_len) ? { dash: { length: 2.1, space: 1 } } : null)
      },
      table: {
        widths: ['*', 'auto'],
        body: [
          [this.table_header_cell('Item Name'), this.table_header_cell('Amount', 'right')],

          ...(menus || []).map(x => {
            const { menus_id, unit_price, qty, total_price, discount, discount_type, merchant_uom_id } =
              (x as InvoicesMenus) || {};

            const name = this.getMenuName(menus_id as Menus);
            const qty_text = textToPdfmakeText(`${this.qty_format(qty)} ${merchant_uom_id?.name || ''} x`.trim());
            const discount_symbol = discount_type === 'percentage' ? '%' : undefined;
            const discount_text = Number(discount)
              ? {
                  width: 'auto',
                  columns: [
                    { width: 'auto', text: '-' },
                    {
                      width: 'auto',
                      text: this.value_format(Number(discount), { symbol: discount_symbol }),
                      marginTop: OFFSET_MT
                    }
                  ]
                }
              : undefined;

            const row: TableCell[] = [
              {
                stack: [
                  { text: name },
                  {
                    fontSize: 6,
                    columnGap: 3,
                    columns: [
                      { width: 'auto', text: qty_text },
                      { width: 'auto', text: this.value_format(unit_price), marginTop: OFFSET_MT },
                      discount_text
                    ]
                  }
                ] as never
              },
              {
                columns: [
                  {
                    text: textToPdfmakeText(this.currency.symbol),
                    width: 'auto',
                    marginRight: 1,
                    marginTop: OFFSET_MT
                  },
                  { text: this.currency_format(total_price), width: '*', alignment: 'right' }
                ]
              }
            ];

            return row;
          }),

          ...(total_rows as TableCell[][])
        ]
      }
    };
  }

  private table_header_cell(title: string, alignment?: 'right'): Content {
    return [{ text: title, alignment, bold: true }];
  }

  private value_format(value?: number | null, opt?: { symbol?: string }): Content {
    const { symbol } = opt || {};
    return {
      text: [
        { text: symbol ?? textToPdfmakeText(this.currency.symbol) }, //
        { text: ` ${this.currency_format(value)}` }
      ]
    };
  }

  private price_row(opt: PriceRow): TableCell[] {
    const { title, value, bold, currency, symbol } = opt;

    return [
      { bold, text: title || '' },
      {
        columns: [
          {
            bold,
            width: 'auto',
            text: symbol ?? textToPdfmakeText(this.currency.symbol),
            marginRight: 1,
            marginTop: OFFSET_MT
          },
          { bold, width: '*', text: this.currency_format(value, currency), alignment: 'right' }
        ]
      }
    ];
  }

  private note(): Content {
    if (!this.data.invoice.note) return null as never;
    return { stack: htmlToPdfmakeText(`Note: ${this.data.invoice.note}`) };
  }

  async getDefinition(): Promise<TDocumentDefinitions> {
    // this.cutoff()
    const contents: Content = [this.header(), this.info(), this.table(), this.note(), this.footer()];
    const [LOGO, KHQR] = await Promise.all([getImageBase64(this.merchant_logo), getImageBase64(this.merchant_khqr)]);
    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: { LOGO, KHQR },
      pageMargins: [8, 8],
      pageOrientation: 'portrait',
      // https://www.conversionunites.com/converter-mm-to-points
      pageSize: {
        width: 140, // 50mm
        height: 'auto'
      },
      styles: this.styles
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

function isDashLine(rowIndex: number, menu_length: number, total_length: number) {
  return rowIndex <= 1 || rowIndex === menu_length + 1 || rowIndex === total_length + 1;
}
