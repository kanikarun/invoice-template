// Format the price above to USD using the locale, style, and currency.
const USDollar = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
});

const KHRiel = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'KHR',
  minimumFractionDigits: 0
});

export function discount(value: number, percentage: number) {
  return value * ((100 - percentage) / 100);
}

// Splitting Non-Numbers and Numbers with thousand separators (e.g., commas or periods)
// https://g.co/gemini/share/0ab4d9ebce78
const REGEX = /\d+(,\d{3})*(\.\d+)?|\D+/g;
const NumFormat = new Intl.NumberFormat('en-US');

/**
 *
 * @link https://bobbyhadz.com/blog/javascript-parse-string-with-comma-to-number
 */
export function currencyFormat(currency: 'USD' | 'KHR', price?: number | string | null) {
  if (!price) return val(null, false);

  const num = Number(price.toString().replace(/,/g, ''));

  if (num === 0) return val(null, false);

  if (!isNaN(num)) {
    const value = currency === 'KHR' ? KHRiel.format(num) : USDollar.format(num);
    return val(value, true);
  }

  let symbol = currency === 'KHR' ? 'KHR ' : '$';
  let v = (price.toString().match(REGEX) || []) //
    .map(x => (isNaN(+x) ? x : NumFormat.format(+x)))
    .join('');

  if (v.toString().includes('?')) {
    v = v.toString().replaceAll('?', '');
    symbol = '';
  }

  return val(`${symbol}${v}`, false);
}

function val(value: string | null, isNumber: boolean) {
  return { value, isNumber };
}
