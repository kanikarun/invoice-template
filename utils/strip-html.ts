/**
 * Remove all HTML Tag
 *
 * @link https://stackoverflow.com/a/76242099
 */
export function stripHTML(text: NullableString) {
  return (text || '').replace(/(<([^>]+)>)/gi, '');
}
