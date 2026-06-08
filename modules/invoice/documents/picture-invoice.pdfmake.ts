import type { Content, ContentColumns, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { siteConfig } from '@/config/site';
import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { DirectusFiles, InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

const DEFAULT_HEIGHT = 33;
const DEFAULT_SLICE = 5;

export class PictureInvoiceDocument extends BaseInvoiceDocument {
  private get BASE_EMPTY_ROWS() {
    const BASE = 5;
    const extra = this.show_signature ? 2 : 0;
    return BASE - extra;
  }

  private readonly styles: Record<string, Style> = {
    the_title: { alignment: 'center', bold: true, fontSize: 12 },
    inv_title: { alignment: 'center', bold: true, fontSize: 9.5, marginBottom: 2 },
    tbl_title: { alignment: 'center', bold: true, color: this.text_color }
  };

  private readonly defaultStyle: Style = {
    color: '#222',
    fontSize: 8.5,
    font: 'Khmer'
  };

  private get horizontal_line(): Content {
    return {
      margin: [0, 5],
      canvas: [{ type: 'line', x1: 20, y1: 0, x2: 400, y2: 0, lineWidth: 0.5 }]
    };
  }

  private header(): Content {
    const content: Content = [
      { text: this.merchant_name, style: 'the_title' },
      {
        stack: htmlToPdfmakeText(this.data.merchant.invoice_header),
        fontSize: 7.5,
        alignment: 'center',
        margin: [65, 0, 65, 2]
      }
    ];

    if (this.merchant_telephone) {
      content.push({ text: `លេខទូរស័ព្ទ | Phone: ${this.merchant_telephone}`, fontSize: 7.5, alignment: 'center' });
    }

    content.push({ text: 'វិក្កយបត្រ / INVOICE', style: 'inv_title', color: this.text_color });
    return content;
  }

  private footer(): Content {
    return [
      this.horizontal_line,
      {
        layout: 'noBorders',
        fontSize: 8,
        margin: [20, 0, 20, 0],
        table: {
          widths: ['*', '*'],
          body: [[['Thank you for support !'], [{ text: 'សូមអរគុណចំពោះការគាំទ្រ !', alignment: 'right' }]]]
        }
      }
    ];
  }

  private info_table(): Content {
    const { date, invoice_no } = this.data.invoice || {};
    const { fullname, phone, tin, address } = this.getCustomer();

    const content: Content = [
      {
        marginTop: 3,
        columns: [
          {
            width: '*',
            layout: {
              defaultBorder: false,
              paddingBottom: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0
            },
            margin: 0,
            table: {
              widths: ['auto', '*'],
              body: [
                [{ marginRight: 3, text: 'អតិថិជន | Customer:' }, { text: fullname }],
                [{ marginRight: 3, text: 'លេខទូរស័ព្ទ | Phone:' }, phone]
              ]
            }
          },
          {
            width: '40%',
            layout: {
              defaultBorder: false,
              paddingBottom: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 0,
              paddingTop: () => 0
            },
            margin: 0,
            table: {
              widths: ['*', 'auto'],
              body: [
                [{ alignment: 'right', marginRight: 3, text: 'កាលបរិច្ឆេទ | Date:' }, getDate(date)],
                [{ alignment: 'right', marginRight: 3, text: 'វិក្កយបត្រ | Invoice No:' }, invoice_no || '-']
              ]
            }
          }
        ]
      }
    ];

    if (tin) {
      content.push(`លេខអត្តសញ្ញណកម្ម អតប | VATTIN: ${tin}`);
    }

    if (address) {
      content.push(`អាស័យដ្ឋាន | Address: ${address.replaceAll('\n', ' ')}`);
    }

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

    const widths = [15, DEFAULT_HEIGHT, '*', 'auto', 50, 50, 50];
    const header_row: TableCell[] = [
      { style: 'tbl_title', text: 'ល.រ\nNo.' },
      { style: 'tbl_title', text: 'រូបភាព\nImage' },
      { style: 'tbl_title', text: 'ឈ្មោះ និងបរិយាយទំនិញ\nItem & Description' },
      { style: 'tbl_title', text: 'ចំនួន\nQty' },
      { style: 'tbl_title', text: 'តម្លៃ\nUnit Price' },
      { style: 'tbl_title', text: 'បញ្ចុះតម្លៃ\nDiscount' },
      { style: 'tbl_title', text: 'សរុប\nAmount' }
    ];

    if (this.no_item_discount) {
      widths.splice(DEFAULT_SLICE, 1);
      header_row.splice(DEFAULT_SLICE, 1);
    }

    const total_text = 'សរុប \nTotal Price';
    const _discount = discount_type === 'percentage' && Number(discount) ? `(${Number(discount)}%)` : '';
    const discount_text = `បញ្ចុះតម្លៃ ${_discount} \nDiscount ${_discount}`;
    const _deposit = deposit_type === 'percentage' && Number(deposit) ? `(${Number(deposit)}%)` : '';
    const deposit_text = `ប្រាក់កក់ ${_deposit} \nDeposit ${_deposit}`;
    const delivery_text = 'ថ្លៃដឹកជញ្ជូន \nDelivery Fee';
    const tax_text = `អាករតម្លៃបន្ថែម (${Number(tax_percentage)}%) \nVAT (${Number(tax_percentage)}%)`;
    const subtotal_text = this.no_deposit_price ? 'សរុបរួម \nSub Total' : 'ប្រាក់ត្រូវបង់ \nBalance Due';
    const exchange_rate_text = `សរុបរួមរៀល\nIn Riel (៛ ${this.currency_format(Number(exchange_rate), 'KHR')})`;
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
      marginTop: 3,
      layout: {
        hLineColor: this.border_color,
        vLineColor: this.border_color,
        vLineWidth: () => 0.5,
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

            const menu = menus_id as Menus;
            const name = this.getMenuName(menu);
            const discount_symbol = discount_type === 'percentage' ? '%' : undefined;
            const qty_text = textToPdfmakeText(`${this.qty_format(qty)} ${merchant_uom_id?.name || ''}`.trim());

            const row: TableCell[] = [
              { alignment: 'center', text: i + 1 },
              {
                alignment: 'center',
                image: (menu?.image as DirectusFiles)?.id || 'null',
                fit: [DEFAULT_HEIGHT, DEFAULT_HEIGHT]
              },
              { text: name },
              { alignment: 'center', text: qty_text },
              { ...this.price_cell(unit_price) },
              { ...this.price_cell(Number(discount), { symbol: discount_symbol }) },
              { ...this.price_cell(total_price) }
            ];

            if (this.no_item_discount) row.splice(DEFAULT_SLICE, 1);

            return row;
          }),

          ...emptyRows.map((_, i) => {
            const isLast = i == (emptyRows?.length || 0) - 1;
            const border = [true, false, true, isLast] as [boolean, boolean, boolean, boolean];
            const row: TableCell[] = [
              { border, text: ' ' },
              { border, image: siteConfig.Img1pixel, height: DEFAULT_HEIGHT },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' },
              { border, text: ' ' }
            ];

            if (this.no_item_discount) row.splice(DEFAULT_SLICE, 1);

            return row;
          }),

          ...(total_rows as TableCell[][])
        ]
      }
    };
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
          colSpan: 3,
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
                  { fontSize: 7.5, stack: htmlToPdfmakeText(this.data.invoice.note), marginBottom: 4 },
                  { fontSize: 7.5, stack: htmlToPdfmakeText(this.data.merchant.invoice_note), marginBottom: 4 },
                  { fontSize: 7.5, stack: htmlToPdfmakeText(this.data.merchant.payment_note), marginBottom: 4 },
                  this.khqr_table()
                ]
              ]
            ]
          }
        }
      : { colSpan: 2, text: '', marginTop: 6 };

    const text_cell: TableCell = is_empty ? { border, text: '' } : { text: title || '' };
    const price_cell: TableCell = is_empty
      ? { border, text: '' }
      : [this.price_cell(value, { marginTop: 6, currency, symbol })];

    if (this.no_item_discount) {
      return [
        img_row, // 1. No
        '', // 2. Image
        '', // 3. Name
        { colSpan: 2, fontSize: 8, ...text_cell }, // 4. Qty
        '', // 5. Unit price
        price_cell // 6. Amount
      ];
    }

    return [
      img_row, // 1. No
      '', // 2. Image
      '', // 3. Name
      { colSpan: 3, fontSize: 8, ...text_cell }, // 4. Qty
      '', // 5. Unit price
      '', // 6. Discount
      price_cell // 7. Amount
    ];
  }

  private signature_table(): Content {
    if (!this.show_signature) return [];
    return {
      layout: 'noBorders',
      table: {
        widths: ['*', '*'],
        heights: [55, 'auto', 'auto'],
        body: [
          ['', { alignment: 'center', image: 'SIGNATURE', fit: ['auto', 50] }],
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
            { alignment: 'center', fontSize: 8, stack: ['ហត្ថលេខា និងឈ្មោះ អ្នកទិញ', "Customer's Signature & Name"] },
            { alignment: 'center', fontSize: 8, stack: ['ហត្ថលេខា និងឈ្មោះ អ្នកលក់', "Seller's Signature & Name"] }
          ]
        ]
      }
    } as Content;
  }

  async getDefinition(): Promise<TDocumentDefinitions> {
    const contents: Content = [
      {
        image: 'LOGO',
        fit: [75, 45],
        absolutePosition: { x: 15, y: 15 }
      },
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

    const images = await Promise.all(
      this.data.invoice.menus.map(async (x: InvoicesMenus) => {
        const imageObj = (x.menus_id as Menus).image as DirectusFiles;
        if (!imageObj) {
          return { ['null']: siteConfig.Img1pixel };
        }
        const image = await getImageBase64(this.getImageUrl(imageObj));
        return { [imageObj.id]: image };
      })
    );

    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: { LOGO, KHQR, SIGNATURE, ...Object.assign({}, ...images) },
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
