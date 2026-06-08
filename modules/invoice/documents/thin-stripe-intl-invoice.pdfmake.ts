import type { Content, ContentColumns, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

export class ThinStripeIntlInvoiceDocument extends BaseInvoiceDocument {
  private get BASE_EMPTY_ROWS() {
    const BASE = 10;
    const extra = this.show_signature ? 4 : 0;
    return BASE - extra;
  }

  private readonly styles: Record<string, Style> = {
    the_title: { bold: true, fontSize: 10 },
    inv_title: { bold: true, fontSize: 15, color: this.text_color },
    tbl_title: { alignment: 'center', bold: true, color: this.text_color },
    tbl_total: { bold: true, color: this.text_color }
  };

  private readonly defaultStyle: Style = {
    color: '#222',
    fontSize: 8.5,
    font: 'Khmer'
  };

  private header(): Content {
    const { date, invoice_no } = this.data.invoice || {};
    const image: Content = { width: 45, image: 'LOGO', fit: [45, 45] };
    const title: Content = { text: 'INVOICE', style: 'inv_title' };
    const merchant: Content = { text: this.merchant_name || '', style: 'the_title' };
    const header = htmlToPdfmakeText(this.data.merchant.invoice_header);
    const invoiceNo = { text: `Invoice No : ${invoice_no}` };
    const invoiceDate = { text: `Date : ${getDate(date)}` };
    const svg: Content = {
      relativePosition: { x: 24 },
      alignment: 'right',
      width: 220,
      svg: `<svg width="534" height="19" viewBox="0 0 534 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 0L0 19H32L38 0H6Z" fill="${this.text_color}"/>
              <path d="M40 0L34 19H66L72 0H40Z" fill="${this.dark_color}"/>
              <path d="M74 0L68 19H528L534 0H74Z" fill="#2B2B2B"/>
            </svg>`
    };

    const body: TableCell[][] = [];
    if (this.merchant_invoice_tin) body.push([{ text: 'VATTIN' }, ` : ${this.merchant_invoice_tin}`]);
    if (this.merchant_telephone) body.push([{ text: 'Phone No' }, ` : ${this.merchant_telephone}`]);

    const tbl_content: Content = [
      {
        columns: [
          {
            width: '*',
            layout: {
              defaultBorder: false,
              paddingBottom: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 3,
              paddingTop: () => 0
            },
            margin: 0,
            table: {
              widths: ['auto', '*'],
              body
            }
          }
        ]
      }
    ];

    const content: Content = [
      svg,
      {
        margin: [0, 15, 0, 6],
        columns: [
          image,
          {
            alignment: 'right',
            stack: [title, invoiceNo, invoiceDate]
          }
        ]
      },
      {
        alignment: 'left',
        stack: [merchant, { text: header }]
      }
    ];

    if (this.merchant_invoice_tin || this.merchant_telephone) {
      content.push(tbl_content);
    }

    return content;
  }

  private footer(): Content {
    return [
      {
        relativePosition: { x: -20, y: -10 },
        width: 500,
        svg: `<svg width="1035" height="72" viewBox="0 0 1035 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M34 26L27 45H593L599 26H34Z" fill="#2B2B2B"/>
              <path d="M646.163 37L642 49L639.87 56H1029L1035 37H672H646.163Z" fill="#2B2B2B"/>
              <path d="M613 0L596 49H642L646.163 37L659 0H613Z" fill="${this.text_color}"/>
              <path d="M642 49H596H7L0 72H635L639.87 56L642 49Z" fill="${this.text_color}"/>
              <path d="M672 37L659 0L646.163 37H672Z" fill="${this.dark_color}"/>
            </svg>`
      }
    ];
  }

  private info_table(): Content {
    const { phone, tin, address } = this.getCustomer();
    const body: TableCell[][] = [
      [{ text: 'Bill To', bold: true, fontSize: 7.5, marginBottom: 3 }, ''],
      [{ text: 'Name' }, { text: textToPdfmakeText(` : ${this.data.invoice?.customer?.fullname || '-'}`) }],
      [{ text: 'Phone No' }, ` : ${phone}`]
    ];

    if (tin) body.push([{ text: 'VATTIN' }, ` : ${tin}`]);
    if (address) body.push([{ text: 'Address' }, ` : ${address.replaceAll('\n', ' ')}`]);

    const content: Content = [
      {
        marginTop: 6,
        columns: [
          {
            width: '*',
            layout: {
              defaultBorder: false,
              paddingBottom: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 3,
              paddingTop: () => 0
            },
            margin: 0,
            table: {
              widths: ['auto', '*'],
              body
            }
          }
        ]
      }
    ];

    return content;
  }

  private khqr_table(): Content {
    if (!this.merchant_khqr) return { text: '' };

    return {
      margin: 0,
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingTop: () => 0,
        paddingBottom: () => 0,
        paddingLeft: () => 0,
        paddingRight: () => 0
      },
      table: {
        widths: ['auto'],
        body: [[{ image: 'KHQR', alignment: 'center', fit: [200, 70] }]]
      }
    };
  }

  private menu_table(): Content {
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

    const widths = [15, '*', 'auto', 58, 58, 58];
    const header_row: TableCell[] = [
      { style: 'tbl_title', text: 'No.' },
      { style: 'tbl_title', text: 'Item & Description' },
      { style: 'tbl_title', text: 'Qty' },
      { style: 'tbl_title', text: 'Unit Price' },
      { style: 'tbl_title', text: 'Discount' },
      { style: 'tbl_title', text: 'Amount' }
    ];

    if (this.no_item_discount) {
      widths.splice(4, 1);
      header_row.splice(4, 1);
    }

    const total_text = 'Total Price';
    const _discount = discount_type === 'percentage' && Number(discount) ? `(${Number(discount)}%)` : '';
    const discount_text = `Discount ${_discount}`;
    const _deposit = deposit_type === 'percentage' && Number(deposit) ? `(${Number(deposit)}%)` : '';
    const deposit_text = `Deposit ${_deposit}`;
    const delivery_text = 'Delivery Fee';
    const tax_text = `VAT (${Number(tax_percentage)}%)`;
    const subtotal_text = this.no_deposit_price ? 'Sub Total' : 'Balance Due';
    const exchange_rate_text = `In Riel (៛ ${this.currency_format(Number(exchange_rate), 'KHR')})`;
    const sub_total_in_riel = Number(sub_total) * Number(exchange_rate);

    const total_rows = [
      this.price_row({ title: total_text, value: total_price, is_img_row: true }),
      this.no_discount_price ? null : this.price_row({ title: discount_text, value: -(discount_price || 0) }),
      this.no_delivery_price ? null : this.price_row({ title: delivery_text, value: delivery_price }),
      this.no_tax_price ? null : this.price_row({ title: tax_text, value: tax_price }),
      this.no_deposit_price ? null : this.price_row({ title: deposit_text, value: deposit_price || 0 }),
      this.no_sub_total ? null : this.price_row({ title: subtotal_text, value: sub_total }),
      this.no_exchange_rate
        ? null
        : this.price_row({ title: exchange_rate_text, value: sub_total_in_riel, currency: 'KHR', symbol: '៛' }),
      this.price_row({ is_empty: true })
    ].filter(x => x);

    const emptyRows = Array.from(Array(Math.max(0, this.BASE_EMPTY_ROWS - menus.length)).keys());

    return {
      marginTop: 9,
      layout: {
        hLineColor: this.border_color,
        vLineColor: this.border_color,
        vLineWidth: () => 0,
        hLineWidth: () => 0.5,
        paddingTop: () => 3,
        paddingBottom: () => 3,
        fillColor: rowIndex => (!rowIndex ? this.background_color : null)
      },
      table: {
        widths,
        headerRows: 1,
        body: [
          header_row,

          ...(menus || []).map((x, i) => {
            const { menus_id, unit_price, qty, total_price, discount, discount_type, merchant_uom_id } =
              (x as InvoicesMenus) || {};

            const isLast = i == (menus?.length || 0) - 1;
            const isRunOutEmpty = emptyRows.length <= 0;
            const border = [true, false, true, isRunOutEmpty ? isLast : false] as [boolean, boolean, boolean, boolean];
            const name = this.getMenuName(menus_id as Menus);
            const discount_symbol = discount_type === 'percentage' ? '%' : undefined;
            const qty_text = textToPdfmakeText(`${this.qty_format(qty)} ${merchant_uom_id?.name || ''}`.trim());

            const row: TableCell[] = [
              { border, alignment: 'center', text: i + 1 },
              { border, text: name },
              { border, alignment: 'center', text: qty_text },
              { border, ...this.price_cell(unit_price) },
              { border, ...this.price_cell(Number(discount), { symbol: discount_symbol }) },
              { border, ...this.price_cell(total_price) }
            ];

            if (this.no_item_discount) row.splice(4, 1);

            return row;
          }),

          ...emptyRows.map((_, i) => {
            const isLast = i == (emptyRows?.length || 0) - 1;
            const border = [true, false, true, isLast];
            const row = [
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' }
            ];

            if (this.no_item_discount) row.splice(4, 1);

            return row;
          }),

          ...(total_rows as TableCell[][])
        ]
      }
    } as Content;
  }

  private price_cell(
    value?: number | null,
    opt?: { marginTop?: number; symbol?: string; currency?: string }
  ): ContentColumns {
    value = value ?? 0; // Must force zero
    const { currency, symbol, marginTop = 0 } = opt || {};
    const subtractSymbol = value < 0 ? '-' : '';
    return {
      alignment: 'right',
      columns: [
        {
          text: symbol ?? textToPdfmakeText(`${subtractSymbol}${this.currency.symbol}`),
          marginTop: marginTop - 0.5,
          marginRight: 1
        },
        {
          text: [this.currency_format(Math.abs(value), currency)],
          width: 'auto',
          marginTop
        }
      ]
    };
  }

  private price_row(opt: PriceRow): TableCell[] {
    const { title, value, is_img_row, is_empty, currency, symbol } = opt;
    const border = [false, false, false, false] as [boolean, boolean, boolean, boolean];

    const r1 = this.no_discount_price ? 0 : 1;
    const r2 = this.no_delivery_price ? 0 : 1;
    const r3 = this.no_sub_total ? 0 : 1;
    const r4 = this.no_tax_price ? 0 : 1;
    const r5 = this.no_exchange_rate ? 0 : 1;
    const r6 = this.no_deposit_price ? 0 : 1;

    const img_row: TableCell = is_img_row
      ? {
          colSpan: 2,
          rowSpan: 1 + r1 + r2 + r3 + r4 + r5 + r6 + 1, // total + discount + delivery + tax + sub total + exchange rate + deposit + empty row
          border,
          layout: {
            hLineWidth: () => 0,
            vLineWidth: () => 0,
            paddingBottom: () => 0,
            paddingLeft: () => 0,
            paddingRight: () => 0,
            paddingTop: () => 0
          },
          table: {
            widths: ['*'],
            body: [
              [
                [
                  { stack: htmlToPdfmakeText(this.data.invoice.note), marginBottom: 4 },
                  { stack: htmlToPdfmakeText(this.data.merchant.invoice_note), marginBottom: 4 },
                  { stack: htmlToPdfmakeText(this.data.merchant.payment_note), marginBottom: 4 },
                  this.khqr_table()
                ]
              ]
            ]
          }
        }
      : { colSpan: 2, text: '' };

    const text_cell: TableCell = is_empty ? { border, text: '' } : { style: 'tbl_total', text: title || '' };
    const price_cell: TableCell = is_empty ? { border, text: '' } : [this.price_cell(value, { currency, symbol })];

    if (this.no_item_discount) {
      return [
        img_row, // 1. No
        '', // 2. Name
        { colSpan: 2, ...text_cell, fillColor: !is_empty ? this.background_color : undefined }, // 3. Qty
        '', // 4. Unit price
        price_cell // 5. Amount
      ];
    }

    return [
      img_row, // 1. No
      '', // 2. Name
      { colSpan: 3, ...text_cell, fillColor: !is_empty ? this.background_color : undefined }, // 3. Qty
      '', // 4. Unit price
      '', // 5. Discount
      price_cell // 6. Amount
    ];
  }

  private signature_table(): Content {
    if (!this.show_signature) return [];
    return {
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        heights: ['auto', 'auto', 'auto'],
        body: [
          ['', { alignment: 'center', image: 'SIGNATURE', fit: ['auto', 40] }],
          [
            {
              alignment: 'center',
              canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5 }]
            },
            {
              alignment: 'center',
              canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 0, x2: 150, y2: 0, lineWidth: 0.5 }]
            }
          ],
          [
            { alignment: 'center', stack: ["Customer's Signature & Name"] },
            { alignment: 'center', stack: ["Seller's Signature & Name"] }
          ]
        ]
      }
    } as Content;
  }

  async getDefinition(): Promise<TDocumentDefinitions> {
    const contents: Content = [
      {
        layout: 'noBorders',
        table: {
          widths: ['*'],
          body: [[[this.header(), this.info_table(), this.menu_table(), this.signature_table()]]]
        }
      }
    ];

    const [LOGO, KHQR, SIGNATURE] = await Promise.all([
      getImageBase64(this.merchant_logo),
      getImageBase64(this.merchant_khqr),
      getImageBase64(this.merchant_signature)
    ]);

    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: { LOGO, KHQR, SIGNATURE },
      pageMargins: [20, 20, 20, 35],
      pageOrientation: 'portrait',
      pageSize: 'A5',
      styles: this.styles,
      footer: () => this.footer()
    };
  }
}

interface PriceRow {
  title?: string;
  value?: number | null;
  currency?: string;
  symbol?: string;
  is_img_row?: boolean;
  is_empty?: boolean;
}
