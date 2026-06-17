import { readFileSync } from 'node:fs';
import path from 'node:path';

import htmlToPdfmake from 'html-to-pdfmake';
import { JSDOM } from 'jsdom';
import PdfMake from 'pdfmake/build/pdfmake';
import { Content, ContentText, TDocumentDefinitions } from 'pdfmake/interfaces';

import { siteConfig } from '@/config/site';

const { window } = new JSDOM('');

const getFont = (f: string) => readFileSync(path.join(process.cwd(), 'public', 'fonts', f));
const HanumanRegular = getFont('Hanuman-Regular.ttf');
const HanumanBold = getFont('Hanuman-Bold.ttf');
const NotoSansRegular = getFont('NotoSans/NotoSans-Regular.ttf');
const NotoSansBold = getFont('NotoSans/NotoSans-SemiBold.ttf');
const MoulRegular = getFont('Moul-Regular.ttf');
// ------
const NotoEmojiRegular = getFont('NotoEmoji/NotoEmoji-Regular.ttf');
const NotoEmojiBold = getFont('NotoEmoji/NotoEmoji-SemiBold.ttf');
const NotoSansJPRegular = getFont('NotoSansJP/NotoSansJP-Regular.ttf');
const NotoSansJPBold = getFont('NotoSansJP/NotoSansJP-SemiBold.ttf');
const NotoSansKRRegular = getFont('NotoSansKR/NotoSansKR-Regular.ttf');
const NotoSansKRBold = getFont('NotoSansKR/NotoSansKR-SemiBold.ttf');
const NotoSansSCRegular = getFont('NotoSansSC/NotoSansSC-Regular.ttf');
const NotoSansSCBold = getFont('NotoSansSC/NotoSansSC-SemiBold.ttf');
const NotoSansThaiRegular = getFont('NotoSansThai/NotoSansThai-Regular.ttf');
const NotoSansThaiBold = getFont('NotoSansThai/NotoSansThai-SemiBold.ttf');
const LibreRegular = getFont('LibreBaskerville/LibreBaskerville-Regular.ttf');
const LibreItalic = getFont('LibreBaskerville/LibreBaskerville-Italic.ttf');
const LibreBold = getFont('LibreBaskerville/LibreBaskerville-Bold.ttf');
const LibreBoldItalic = getFont('LibreBaskerville/LibreBaskerville-BoldItalic.ttf');

const fonts = {
  Khmer: {
    normal: HanumanRegular,
    bold: HanumanBold,
    italics: HanumanRegular,
    bolditalics: HanumanBold
  },
  Moul: {
    normal: MoulRegular,
    bold: MoulRegular,
    italics: MoulRegular,
    bolditalics: MoulRegular
  },
  Noto: {
    normal: NotoSansRegular,
    bold: NotoSansBold,
    italics: NotoSansRegular,
    bolditalics: NotoSansBold
  },
  Emoji: {
    normal: NotoEmojiRegular,
    bold: NotoEmojiBold,
    italics: NotoEmojiRegular,
    bolditalics: NotoEmojiBold
  },
  Chinese: {
    normal: NotoSansSCRegular,
    bold: NotoSansSCBold,
    italics: NotoSansSCRegular,
    bolditalics: NotoSansSCBold
  },
  Japanese: {
    normal: NotoSansJPRegular,
    bold: NotoSansJPBold,
    italics: NotoSansJPRegular,
    bolditalics: NotoSansJPBold
  },
  Korean: {
    normal: NotoSansKRRegular,
    bold: NotoSansKRBold,
    italics: NotoSansKRRegular,
    bolditalics: NotoSansKRBold
  },
  Thai: {
    normal: NotoSansThaiRegular,
    bold: NotoSansThaiBold,
    italics: NotoSansThaiRegular,
    bolditalics: NotoSansThaiBold
  },
  Libre: {
    normal: LibreRegular,
    bold: LibreBold,
    italics: LibreItalic,
    bolditalics: LibreBoldItalic
  }
};

function nodeToWebStream(stream: NodeJS.ReadableStream) {
  return new ReadableStream({
    start(controller) {
      stream.on('data', chunk => controller.enqueue(chunk));
      stream.on('end', () => controller.close());
      stream.on('error', err => controller.error(err));
    }
  });
}

export async function createPdf2(document: TDocumentDefinitions) {
  const pdfmake = PdfMake.createPdf(document, {}, fonts);
  const nodeStream = pdfmake.getStream();

  // IMPORTANT
  nodeStream.end();

  return nodeToWebStream(nodeStream);
}

export async function createPdf(document: TDocumentDefinitions) {
  return new Promise<Buffer>(resolve => {
    const chunks: Buffer[] = [];

    // Call instance of pdfmake with fonts parameter
    const pdfmake = PdfMake.createPdf(document, {}, fonts);
    const doc = pdfmake.getStream();

    // Listen to event and get chunks
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks as never)));
    doc.end(); // Don't forget to close the event after everything done
  });
}

export async function getImageBase64(url: string) {
  if (!(url || '').startsWith('http')) return url;
  try {
    const res = await fetch(url);
    const contentType = res.headers.get('content-type');
    if (!contentType?.startsWith('image')) return siteConfig.Img1pixel;

    const buffer = await res.arrayBuffer();
    const stringBuffer = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${stringBuffer}`;
  } catch (error) {
    return siteConfig.Img1pixel;
  }
}

const isHtmlString = (text: string) => {
  // https://stackoverflow.com/questions/15458876/check-if-a-string-is-html-or-not/25381038
  return /<\/?[a-z][\s\S]*>/i.test(text);
};

export function htmlToPdfmakeText(html?: string | null): Content[] {
  const __html = html || '';
  // Change &nbsp; and \n because of Rich text in mobile
  const text = (isHtmlString(__html) ? __html : `<p>${__html}</p>`)
    .replaceAll('&nbsp;', '<br/>')
    .replaceAll(/\n/g, '<br/>');

  if (!text) return [];

  const headerStyle = { fontSize: null as never, bold: true };
  const content = htmlToPdfmake(text, {
    window,
    ignoreStyles: ['font-family', 'font-size'],
    defaultStyles: {
      br: { margin: [0, 0, 0, 0] },
      p: { margin: [0, 0, 0, 0] },
      a: { color: '#0284c7', decoration: 'underline' },
      ul: { marginBottom: 0, marginLeft: 5 },
      // ----
      h1: headerStyle,
      h2: headerStyle,
      h3: headerStyle,
      h4: headerStyle,
      h5: headerStyle,
      h6: headerStyle
    }
  });

  function casting(c: ContentText) {
    return Array.isArray(c)
      ? c.map((x: ContentText) => {
          x.text =
            typeof x.text === 'string'
              ? textToPdfmakeText(x.text, { decoration: x?.decoration, bold: x?.bold })
              : casting(x.text as never);
          return x;
        })
      : [textToPdfmakeText(c?.text as string, { decoration: c?.decoration, bold: c?.bold })];
  }

  return casting(content as ContentText);
}

export function textToPdfmakeText(text?: string | null, style?: Pick<ContentText, 'bold' | 'decoration'>): Content {
  if (!text) return '';

  const v = text
    .replace(/[\u200B-\u200D\uFEFF]/g, '') // remove zero-width space
    .replaceAll('’', "'")
    .replaceAll('•', '-');

  // https://github.com/diegomura/react-pdf/issues/933#issuecomment-1913079205
  const cn = /[\u4E00-\u9FFF\u3400-\u4DBF\uF900-\uFAFF]+/;
  const kr = /[\uAC00-\uD7AF]+/;
  const jp = /[\u3040-\u309F\u30A0-\u30FF]+/;
  const th = /[\u0E00-\u0E7F]+/;
  const em = /[\u{1F300}-\u{1FAA0}\u2610-\u2B50]+/u; // Emoji range
  const cu = /\p{Sc}/u; // Currency symbols

  const cjkRegex = new RegExp(`(${cn.source}|${kr.source}|${jp.source}|${th.source}|${em.source}|${cu.source})`, 'gu');

  const parts = v.split(cjkRegex).filter(Boolean);
  return parts.map(part => {
    let font: string | undefined;
    if (cn.test(part)) {
      font = 'Chinese';
    } else if (kr.test(part)) {
      font = 'Korean';
    } else if (jp.test(part)) {
      font = 'Japanese';
    } else if (th.test(part)) {
      font = 'Thai';
    } else if (em.test(part)) {
      font = 'Emoji';
    } else if (cu.test(part)) {
      if (['៛', '฿'].includes(part)) {
        font = 'Khmer';
      } else if (['￥'].includes(part)) {
        font = 'Japanese';
      } else if (['¥'].includes(part)) {
        font = 'Chinese';
      } else {
        font = 'Noto';
      }
    }
    return { text: part, font, style };
  });
}
