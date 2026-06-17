import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Content, ContentColumns, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';

import { siteConfig } from '@/config/site';
import { getImageBase64, htmlToPdfmakeText, textToPdfmakeText } from '@/lib/pdfmake';
import { DirectusFiles, InvoicesMenus, Menus } from '@/types/directus';
import { getDate } from '@/utils/dayjs';

import { BaseInvoiceDocument } from './base-invoice-document';

const DEFAULT_HEIGHT = 15;

export class FoodieInvoiceDocument extends BaseInvoiceDocument {
  private get BASE_EMPTY_ROWS() {
    const BASE = 5;
    const extra = this.show_signature ? 2 : 0;
    return BASE - extra;
  }

  private readonly styles: Record<string, Style> = {
    the_title: { fontSize:15, alignment: 'right', color: this.border_color},
    inv_title: { fontSize: 15,marginTop:-6, bold: true, alignment: 'center', color:this.border_color},
    tbl_title: { alignment: 'center', bold: true, color: '#e0e0e0',fontSize:7,marginLeft:4 },
    tbl_total: { bold: true, color: this.text_color }
  };

  private readonly defaultStyle: Style = {
    color: this.text_color,
    fontSize: 6.5,
    font: 'Khmer',
    // font:'Noto',
  };

  private header(): Content {
    const { date, invoice_no } = this.data.invoice || {};
    const image: Content = { width: 45, image: 'LOGO', fit: [50, 50] };
    const merchant: Content = { text: this.merchant_name || '', style: 'the_title', marginBottom:3};
    const title: Content = { text: 'វិក្កយបត្រ / INVOICE', style: 'inv_title' };
    const header = htmlToPdfmakeText(this.data.merchant.invoice_header);
    const invoiceNo = { text: `លេខវិក្កយបត្រ / Invoice No : ${invoice_no}` };
    const invoiceDate = { text: `កាលបរិច្ជេទ / Date : ${getDate(date)}` };
    const merchantStack: Content[] = [merchant,header];
    if (this.merchant_invoice_tin) merchantStack.push({ text: `លេខ អតសញ្ញាណកម្ម / VATTIN : ${this.merchant_invoice_tin}`, marginTop: 3 });
    if (this.merchant_telephone) merchantStack.push({ text: `លេខទូរស័ព្ទ / Phone No : ${this.merchant_telephone}` });

    const content: Content = [
      {
        columnGap: 50,
        columns: [
          image,
          {
            stack: [ { stack: merchantStack, alignment: 'right' } ]
          }
        ]
      },
      {
        columns: [ title ]
      },
          {
        margin: [200, 10, 0, 0],
        alignment: 'right',
        stack: [ invoiceNo, invoiceDate ]
      }
  ];
    return content;
  }

  private info_table(): Content {
    const { phone, tin, address } = this.getCustomer();
    const body: TableCell[][] = [];
    body.push(
      [{ text: 'អតិថិជន / Customer' }, { text: textToPdfmakeText(` : ${this.data.invoice?.customer?.fullname || '-'}`) }],
    );
    if (phone && phone !== '-') body.push([{ text: 'លេខទូរស័ព្ទ / Phone No' }, ` : ${phone}`]);
    if (tin) body.push([{ text: 'លេខ អតសញ្ញាណកម្ម / VATTIN' ,noWrap:true}, ` : ${tin}`]);
    if (address) body.push([{ text: 'អាស័យដ្ឋាន / Address' }, ` : ${address.replaceAll('\n', ' ')}`]);
    const content: Content = [
      {
        columns: [
          {
            layout: {
              defaultBorder: false,
              paddingBottom: () => 0,
              paddingLeft: () => 0,
              paddingRight: () => 4,
              paddingTop: () => 0
            },
            marginTop:-19,
            table: {
              widths: ['auto', '*'], body
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

    const widths = [DEFAULT_HEIGHT, '*', 'auto', 60, 60, 60];
    const header_row: TableCell[] = [
      {
        stack: [
          this.getRoundedEdge({ x: -8, y:-5 }, {color: this.border_color,w: 365, h: 28 }),
        ],
      },
      { style: 'tbl_title', text: 'ឈ្មោះ និងបរិយាយទំនិញ\nItem & Description', alignment: 'left', marginLeft: -20 },
      { style: 'tbl_title', text: 'ចំនួន\nQty' },
      { style: 'tbl_title', text: 'តម្លៃ\nUnit Price' },
      { style: 'tbl_title', text: 'បញ្ចុះតម្លៃ\nDiscount' },
      { style: 'tbl_title', text: 'សរុប\nAmount' , marginLeft:21}

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
    const sub_total_in_riel = Number(sub_total) * Number(exchange_rate);
    const subTotal_text = this.no_sub_total ? null : this.price_row({ title: this.no_deposit_price ? 'សរុបរួម / Sub Total' : 'ប្រាក់ត្រូវបង់ / Balance Due', value: sub_total, border_top: true });

    const total_rows = [
      this.price_row({ title: total_text, value: total_price, is_img_row: true }),
      this.no_discount_price ? null : this.price_row({ title: discount_text, value: -(discount_price || 0) }),
      this.no_delivery_price ? null : this.price_row({ title: delivery_text, value: delivery_price }),
      this.no_tax_price ? null : this.price_row({ title: tax_text, value: tax_price }),
      this.no_deposit_price ? null : this.price_row({ title: deposit_text, value: deposit_price || 0 }),
      subTotal_text,
      this.no_exchange_rate ? null : this.price_row({ title: `សរុបរួមរៀល / In Riel (៛ ${this.currency_format(Number(exchange_rate), 'KHR')})`, value: sub_total_in_riel, currency: 'KHR', symbol: '៛' }),
      this.price_row({ is_empty: true })
    ].filter(x => x);

    // const renderedMenus = [...(menus || []),...(menus || []),...(menus || []),...(menus || [])]; //test add menu or slice
    // const menuLen = renderedMenus.length;
    const menuLen = (menus || []).length;
    const emptyRows = Array.from(Array(Math.max(0, this.BASE_EMPTY_ROWS - menuLen)).keys());

    const subTotalLine = subTotal_text ? menuLen + emptyRows.length + 1 + total_rows.indexOf(subTotal_text) : -1;
    return {
      stack: [
        {
          marginTop:12,
          layout: {
            paddingTop: (i) => (i <= menuLen ? 5 : 1),
            paddingBottom: (i) => (i <= menuLen ? 5 : 2),
            vLineWidth: () => 0,
            hLineWidth: (i) => {
              if (i <= 1) return 0;                      // no border on header
              if (i <= menuLen + 1) return 1;       // dividers between items + below last item
              if (i === subTotalLine) return 1; // above Balance Due / In Riel
              return 0;
            },
            hLineColor: () => this.border_color,
            // fillColor: (i) => (i === 0 ? this.border_color : null),
          },
          table: {
            widths,
            headerRows: 1,
            dontBreakRows: true,
            body: [
              header_row,

           ...(menus || []).map((x) => {
            // ...renderedMenus.map((x) => {
            const { menus_id, unit_price, qty, total_price, discount, discount_type, merchant_uom_id } =
              (x as InvoicesMenus) || {};
            const menu = menus_id as Menus;
            const name = this.getMenuName(menu);
            const discount_symbol = discount_type === 'percentage' ? '%' : undefined;
            const qty_text = textToPdfmakeText(`${this.qty_format(qty)} ${merchant_uom_id?.name || ''}`.trim());

            const row: TableCell[] = [
              { alignment: 'center', image: (menu?.image as DirectusFiles)?.id || 'null', fit: [DEFAULT_HEIGHT, DEFAULT_HEIGHT], marginRight:-4 },
              { bold:true, text: name, marginLeft:4},
              { alignment: 'center', text: qty_text },
              { ...this.price_cell(unit_price) },
              { ...this.price_cell(Number(discount), { symbol: discount_symbol }) },
              { ...this.price_cell(total_price), marginRight:6 }
            ];

            if (this.no_item_discount) row.splice(4, 1);

            return row;
          }),

          ...emptyRows.map((_, i) => {
            const isLast = i == (emptyRows?.length || 0) - 1;
            const border = [true, false, true, isLast];
            const row = [
              { border, image: siteConfig.Img1pixel, height: DEFAULT_HEIGHT},
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
    }
  ]
    } as Content;
  }

  private price_cell(
    value?: number | null,
    opt?: { marginTop?: number; symbol?: string; currency?: string }
  ): ContentColumns {
    value = value ?? 0; // Must force zero
    const { currency, symbol, marginTop = 0} = opt || {};
    const subtractSymbol = value < 0 ? '-' : '';
    return {
      alignment: 'right',
      marginRight:5,
      bold:true,
      columns: [
        {
          text: symbol ?? textToPdfmakeText(`${subtractSymbol}${this.currency.symbol}`),
          marginTop: marginTop - 0.5,
          marginRight: 1
        },
        {
          text: [this.currency_format(Math.abs(value), currency)],
          width: '40',
          marginTop
        }
      ]
    };
  }

  private price_row(opt: PriceRow): TableCell[] {
    const { title, value, is_img_row, is_empty, currency, symbol, border_top} = opt;
    const border = [false, !!border_top, false, false] as [boolean, boolean, boolean, boolean];

    const r1 = this.no_discount_price ? 0 : 1;
    const r2 = this.no_delivery_price ? 0 : 1;
    const r3 = this.no_sub_total ? 0 : 1;
    const r4 = this.no_tax_price ? 0 : 1;
    const r5 = this.no_exchange_rate ? 0 : 1;
    const r6 = this.no_deposit_price ? 0 : 1;

    const img_row: TableCell = is_img_row
      ? {
          marginTop:2,
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
                  { stack: htmlToPdfmakeText(this.data.invoice.note) },
                  { stack: htmlToPdfmakeText(this.data.merchant.invoice_note) },
                  { stack: htmlToPdfmakeText(this.data.merchant.payment_note) },
                  this.khqr_table()
                ]
              ]
            ]
          }
        }
      : { colSpan: 2, text: '' };

    const text_cell: TableCell = is_empty ? { border, text: '' } : { border, style: 'tbl_total', text: title || ''};
    const price_cell: TableCell = is_empty ? { border, text: '' } : { border, ...this.price_cell(value, { currency, symbol, marginTop: 2 })};

    if (this.no_item_discount) {
      return [
        img_row, // 1. Image
        '', // 2. Name
        { colSpan: 2, ...text_cell,marginTop:2 }, // 3. Qty
        '', // 4. Unit price
        price_cell, // 5. Amount
      ];
    }

    return [
      img_row, // 1. Image
      '', // 2. Name
      { colSpan: 3, ...text_cell,marginTop:2 }, // 3. Qty
      '', // 4. Unit price
      '', // 5. Discount
      price_cell // 6. Amount
    ];
  }

 private signature_table(): Content {
      if (!this.show_signature) return [];

      return {
        marginTop: -10,
        layout: 'noBorders',
        table: {
          widths: ['*', 'auto'], // push signatures to the right
          body: [
            [
              '',
              {
                layout: 'noBorders',
                table: {
                  widths: [100, 10, 100], // customer, gap, seller
                  body: [
                    [{ text: '' }, '', { image: 'SIGNATURE', fit: ['auto',50], alignment: 'center' }],
                    [
                      {
                        canvas: [
                          { type: 'line', lineColor: this.border_color, x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1 }
                        ]
                      },
                      '',
                      {
                        canvas: [
                          { type: 'line', lineColor: this.border_color, x1: 0, y1: 0, x2: 100, y2: 0, lineWidth: 1 }
                        ]
                      }
                    ],
                    [
                      {
                        stack: [
                          { text: 'អ្នកទិញ', alignment: 'center', fontSize: 6 },
                          { text: this.data.invoice?.customer?.fullname || '', alignment: 'center', fontSize: 6, bold: true}
                        ]
                      }
                      ,'',
                      {
                        stack: [
                          { text: 'អ្នកលក់', alignment: 'center', fontSize: 6 },
                          { text: this.merchant_name || '', alignment: 'center', fontSize: 6, bold: true }
                        ]
                      }
                    ]
                  ]
                }
              }
            ]
          ]
        }
      } as Content;
    }  //SVG pattern
  async getDefinition(): Promise<TDocumentDefinitions> {

    let patternSvg = readFileSync(
      path.join(process.cwd(), 'public', 'foodie.svg'),
      'utf8'
    );

    patternSvg = patternSvg      //color SVG pattern
      .replace(/#bf1304/gi, this.dark_color)
      .replace(/#d95204/gi, this.border_color)
      .replace(/#f26849/gi, this.text_color);
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
    //Paper BG
    const PAPER_BG = readFileSync(
      path.join(process.cwd(), 'public', 'paper-bg.png')
    ).toString('base64');

    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: {
        LOGO,
        KHQR,
        SIGNATURE,
        PAPER_BG: `data:image/png;base64,${PAPER_BG}`,
        PATTERN: `data:image/svg;base64,${patternSvg}`,
        ...Object.assign({}, ...images)
      },

      background: () => ([
        { image: 'PAPER_BG', fit: [420, 595] },
        { svg: patternSvg, fit: [420, 595], opacity: 0, absolutePosition: { x: 0, y: 0 } }
      ]),
      pageMargins: [30, 20, 30, 20],
      pageOrientation: 'portrait',
      pageSize: 'A5',
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
  border_top?: boolean;
}
