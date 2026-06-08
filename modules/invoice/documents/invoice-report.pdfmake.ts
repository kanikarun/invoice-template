import type { Content, Style, TableCell, TDocumentDefinitions } from 'pdfmake/interfaces';
import { capitalize } from 'radash';

import { env } from '@/env';
import { GetInvoicesResult } from '@/lib/directus';
import { getImageBase64, textToPdfmakeText } from '@/lib/pdfmake';
import { Customers, Merchants } from '@/types/directus';
import dayjs, { getDate, getDateString } from '@/utils/dayjs';
import { stripHTML } from '@/utils/strip-html';

import { BaseInvoiceReportDocument } from './base-invoice-document';

export class InvoiceReportDocument extends BaseInvoiceReportDocument {
  private readonly styles: Record<string, Style> = {
    main_title: { alignment: 'right', bold: true, fontSize: 12 }
  };

  constructor(
    protected merchant: Merchants,
    private readonly res: GetInvoicesResult,
    private readonly opt: { from: dayjs.Dayjs; to: dayjs.Dayjs; menu_name?: string }
  ) {
    super(merchant);
  }

  private readonly defaultStyle: Style = {
    color: '#222',
    fontSize: 7,
    font: 'Khmer'
  };

  private header(): Content {
    const s_date = this.opt.from ? getDate(this.opt.from) : '-';
    const e_date = this.opt.to ? getDate(this.opt.to) : '-';
    const period = `For period: ${s_date} - ${e_date}`;

    const upperBody: TableCell[][] = [
      [{ text: 'INVOICE SUMMARY', fontSize: 9, colSpan: 2 }, ''],
      [
        { text: 'Merchant', marginTop: 4 },
        { text: this.merchant_name, marginTop: 4, alignment: 'right' }
      ]
    ];

    if (this.opt.menu_name) {
      upperBody.push(['Menu', { alignment: 'right', text: textToPdfmakeText(this.opt.menu_name) }]);
    }

    return {
      columns: [
        {
          width: '30%',
          stack: [
            {
              width: 110,
              height: 30,
              image: 'LOGO'
            },
            {
              bold: true,
              marginTop: 16,
              marginBottom: 8,
              layout: {
                hLineWidth: i => (i === 1 ? 0.5 : 0),
                vLineWidth: () => 0,
                paddingLeft: () => 0,
                paddingRight: () => 0
              },
              table: {
                widths: ['auto', '*'],
                body: [
                  // ------
                  ...upperBody,
                  ['Phone', { alignment: 'right', text: this.merchant.telephone }],
                  // ------
                  ...(this.res?.total || []).map(x => [
                    `Total ${x.currency.toUpperCase()}`,
                    this.price_cell(x.currency, x.sub_total)
                  ])
                ]
              }
            }
          ]
        },
        [
          { text: 'INVOICE STATEMENT', style: 'main_title' },
          { text: period, alignment: 'right' }
        ]
      ]
    } as Content;
  }

  private footer(currentPage: number, pageCount: number): Content {
    const run_date = getDateString(dayjs().tz('Asia/Phnom_Penh'));
    return [
      {
        margin: [30, 0, 30, 0],
        columns: [
          {
            width: '50%',
            text: `Report run on: ${run_date}`
          },
          {
            width: '50%',
            alignment: 'right',
            text: `Page: ${currentPage} / ${pageCount}`
          }
        ]
      }
    ];
  }

  private table(): Content {
    return {
      layout: {
        paddingTop: () => 6,
        paddingBottom: () => 6,
        vLineWidth: () => 0,
        hLineWidth: () => 0.5,
        fillColor: i => (!i ? '#f9fafb' : null)
      },
      table: {
        headerRows: 1,
        dontBreakRows: true,
        widths: [45, 125, '13%', '13%', '13%', '13%', '13%'],
        body: [
          [
            { text: 'Date', bold: true },
            { text: 'Invoice Detail', bold: true },
            { text: 'Amount', alignment: 'right', bold: true },
            { text: 'Discount', alignment: 'right', bold: true },
            { text: 'Deposit Amount', alignment: 'right', bold: true },
            { text: 'Delivery Fee', alignment: 'right', bold: true },
            { text: 'Sub Total', alignment: 'right', bold: true }
          ],
          // -----
          ...(this.res?.data || []).map<TableCell[]>(x => {
            const cus = x.customer as Customers;
            const phone = cus?.phone ? `(${cus?.phone})` : '';
            const invoice_status = capitalize(x.invoice_status || '-');
            return [
              getDate(x.date),
              {
                stack: [
                  `${x.invoice_no || '-'} (${invoice_status})\n ${cus?.fullname || ''} ${phone}`,
                  Boolean(x.note) ? stripHTML(x.note) : ''
                  // textToPdfmakeText(`${x.invoice_no || '-'} (${invoice_status})\n ${cus?.fullname || ''} ${phone}`),
                  // ...htmlToPdfmakeText(x.note)
                ]
              },
              this.price_cell(x.currency, x.total_price),
              this.price_cell(x.currency, x.discount_price),
              this.price_cell(x.currency, x.deposit_price),
              this.price_cell(x.currency, x.delivery_price),
              this.price_cell(x.currency, x.sub_total)
            ];
          }),
          // -----
          ...(this.res?.total || []).map(x => [
            { colSpan: 2, alignment: 'right', bold: true, text: `Total ${x.currency.toUpperCase()}` },
            '',
            this.price_cell(x.currency, x?.total_price, { bold: true }),
            this.price_cell(x.currency, x?.discount_price, { bold: true }),
            this.price_cell(x.currency, x?.deposit_price, { bold: true }),
            this.price_cell(x.currency, x?.delivery_price, { bold: true }),
            this.price_cell(x.currency, x?.sub_total, { bold: true })
          ])
        ]
      }
    } as Content;
  }

  private price_cell(currency?: string | null, value?: number | null, opt?: { bold?: boolean }): Content {
    return {
      alignment: 'right',
      bold: opt?.bold,
      text: `${this.currency_format(currency, value)} ${currency?.toUpperCase()}`
    };
  }

  async getDefinition(): Promise<TDocumentDefinitions> {
    const contents: Content = [this.header(), this.table()];
    const LOGO = await getImageBase64(`${env.NEXT_PUBLIC_SITE_URL}/images/logo-invoice.png`);

    return {
      content: contents,
      defaultStyle: this.defaultStyle,
      images: { LOGO },
      pageMargins: [30, 30, 30, 30],
      pageOrientation: 'portrait',
      pageSize: 'A4',
      styles: this.styles,
      footer: (cp, pc) => this.footer(cp, pc)
    };
  }
}
