export function getTranslation<T extends Record<string, unknown>>(arr: T[], locale: Locale, field?: 'name' | 'title') {
  if (!arr) return null;

  const result = arr.find(x => (x as T).languages_code === locale);

  if (result && field && !result[field as never]) {
    return arr.at(0);
  }

  return result || arr[0];
}

export function getDiscountTranslation(locale: Locale, percentage: NullableAlphaNum) {
  if (!percentage) return '';

  return locale === 'km' ? `បញ្ចុះតម្លៃ ${percentage}%` : `${percentage}% OFF`;
}
