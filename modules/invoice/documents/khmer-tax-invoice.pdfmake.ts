import * as cheerio from 'cheerio';
import type { Content, ContentColumns, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

export class KhmerTaxInvoiceDocument extends BaseInvoiceDocument {
  private readonly styles: Record<string, Style> = {
    the_title: { alignment: 'center', bold: true, fontSize: 12 },
    the_title_km: { alignment: 'center', fontSize: 10.5, font: 'Moul' },
    inv_title_upper: { alignment: 'center', fontSize: 10, font: 'Moul' },
    inv_title_lower: { alignment: 'center', fontSize: 11, marginBottom: 3, bold: true },
    tbl_title: { alignment: 'center', bold: true }
  };

  private readonly defaultStyle: Style = {
    color: '#222',
    fontSize: 9,
    font: 'Khmer'
  };

  private main_header(): Content {
    const $ = cheerio.load(this.data.merchant.invoice_header || '');
    const invoice_header = $('body').text();

    return [
      { text: this.merchant_name_km, style: 'the_title_km' },
      { text: this.merchant_name, style: 'the_title' },
      {
        margin: [0, 6],
        layout: 'noBorders',
        table: {
          widths: [80, '*'],
          body: [
            [
              {
                rowSpan: 3,
                image: 'LOGO',
                fit: [70, 70],
                absolutePosition: { x: 25, y: 25 }
              },
              `លេខអត្តសញ្ញណកម្ម អតប (VATTIN): ${this.data.merchant.invoice_tin || ''}`
            ],
            [
              '',
              {
                columnGap: 3,
                columns: [{ width: 88, text: 'អាស័យដ្ឋាន / Address:' }, { stack: htmlToPdfmakeText(invoice_header) }]
              }
            ],
            ['', `លេខទូរស័ព្ទ / Phone: ${this.data.merchant.telephone || ''}`]
          ]
        }
      }
    ];
  }

  private invoice_header(): Content {
    return [
      {
        alignment: 'center',
        canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 0, x2: 550, y2: 0, lineWidth: 0.5 }]
      },
      {
        marginTop: 4,
        text: [
          { text: 'វិក្កយបត្រអាករ', style: 'inv_title_upper' }
          // { text: ' / ', style: 'inv_title_lower' },
          // { text: 'បង្កាន់ដៃបង់ប្រាក់', style: 'inv_title_upper' }
        ]
      },
      { text: 'TAX INVOICE', style: 'inv_title_lower' }
    ];
  }

  private info_table(): Content {
    const { date, invoice_no } = this.data.invoice || {};
    const { fullname, phone, tin, address } = this.getCustomer();

    return {
      layout: 'noBorders',
      table: {
        widths: [135, '*', 105, '16%'],
        body: [
          [
            'អតិថិជន / Customer',
            { columnGap: 5, columns: [{ width: 'auto', text: ': ' }, { text: fullname }] },
            'លេខវិក្កយបត្រ / Invoice No',
            `: ${invoice_no}`
          ],
          [
            'អាស័យដ្ឋាន / Address',
            textToPdfmakeText(`: ${address}`),
            'កាលបរិច្ឆេទ / Invoice Date',
            `: ${getDate(date)}`
          ],
          ['លេខទូរស័ព្ទ / Phone', `: ${phone}`, '', ''],
          ['លេខអត្តសញ្ញណកម្ម អតប (VATTIN)', { colSpan: 3, text: `: ${tin}` }, '', '']
        ]
      }
    };
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

    const widths = [15, '*', 40, 70, 70, 70];
    const header_row: TableCell[] = [
      { style: 'tbl_title', text: 'ល.រ\nNo.' },
      { style: 'tbl_title', text: 'បរិយាយទំនិញ/សេវាកម្ម \nDescription of goods and services' },
      { style: 'tbl_title', text: 'បរិមាណ\nQuantity' },
      { style: 'tbl_title', text: 'ថ្លៃឯកតា\nUnit Price' },
      { style: 'tbl_title', text: 'បញ្ចុះតម្លៃ\nDiscount' },
      { style: 'tbl_title', text: 'តម្លៃ\nAmount' }
    ];

    if (this.no_item_discount) {
      widths.splice(4, 1);
      header_row.splice(4, 1);
    }

    const total_text = 'សរុប / Total Price';
    const _discount = discount_type === 'percentage' && Number(discount) ? `(${Number(discount)}%)` : '';
    const discount_text = `បញ្ចុះតម្លៃ / Discount ${_discount}`;
    const _deposit = deposit_type === 'percentage' && Number(deposit) ? `(${Number(deposit)}%)` : '';
    const deposit_text = `ប្រាក់កក់ / Deposit ${_deposit}`;
    const delivery_text = 'ថ្លៃដឹកជញ្ជូន / Delivery Fee';
    const tax_text = `អាករតម្លៃបន្ថែម / VAT (${Number(tax_percentage)}%)`;
    const subtotal_text = 'សរុបទឹកប្រាក់ត្រូវបង់ / Grand Total';
    const exchange_rate_text = `សរុបរួមរៀល / In Riel (៛ ${this.currency_format(Number(exchange_rate), 'KHR')})`;
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

    const emptyRows = Array.from(Array(Math.max(0, 8 - menus.length)).keys());

    return {
      marginTop: 6,
      layout: {
        vLineWidth: () => 0.5,
        hLineWidth: () => 0.5,
        paddingTop: () => 3,
        paddingBottom: () => 3
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
    const { currency, symbol, marginTop = 0 } = opt || {};
    return {
      columns: [
        {
          text: symbol ?? textToPdfmakeText(this.currency.symbol),
          width: 'auto',
          marginTop: marginTop - 0.5
        },
        {
          text: this.currency_format(value, currency),
          width: '*',
          alignment: 'right',
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
                  { fontSize: 8, stack: htmlToPdfmakeText(this.data.invoice.note), marginBottom: 4 },
                  { fontSize: 8, stack: htmlToPdfmakeText(this.data.merchant.invoice_note), marginBottom: 4 },
                  { fontSize: 8, stack: htmlToPdfmakeText(this.data.merchant.payment_note), marginBottom: 4 },
                  this.khqr_table()
                ]
              ]
            ]
          }
        }
      : { colSpan: 2, text: '', marginTop: 0 };

    const text_cell: TableCell = is_empty ? { border, text: '' } : { text: title || '' };
    const price_cell: TableCell = is_empty
      ? { border, text: '' }
      : [this.price_cell(value, { marginTop: 0, currency, symbol })];

    if (this.no_item_discount) {
      return [
        img_row, // 1. No
        '', // 2. Name
        { colSpan: 2, fontSize: 8, ...text_cell }, // 3. Qty
        '', // 4. Unit price
        price_cell // 5. Amount
      ];
    }

    return [
      img_row, // 1. No
      '', // 2. Name
      { colSpan: 3, fontSize: 8, ...text_cell }, // 3. Qty
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
        heights: [60, 'auto', 'auto'],
        body: [
          [
            '',
            {
              alignment: 'center',
              image: 'SIGNATURE',
              fit: ['auto', 70]
            }
          ],
          [
            {
              alignment: 'center',
              canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 10, x2: 200, y2: 10, lineWidth: 0.5 }]
            },
            {
              alignment: 'center',
              canvas: [{ type: 'line', lineColor: 'black', x1: 0, y1: 10, x2: 200, y2: 10, lineWidth: 0.5 }]
            }
          ],
          [
            { alignment: 'center', stack: ['ហត្ថលេខា និងឈ្មោះ អ្នកទិញ', "Customer's Signature & Name"] },
            { alignment: 'center', stack: ['ហត្ថលេខា និងឈ្មោះ អ្នកលក់', "Seller's Signature & Name"] }
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
          body: [
            [[this.main_header(), this.invoice_header(), this.info_table(), this.menu_table(), this.signature_table()]]
          ]
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
      pageMargins: 25,
      pageOrientation: 'portrait',
      pageSize: 'A4',
      styles: this.styles
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
