import qs from 'qs';

import { env } from '@/env';
import { DirectusFiles } from '@/types/directus';

interface Options {
  width?: number;
  height?: number;
  quality?: number;
  size?: 'xs' | 'sm' | 'md';
}

/**
 *
 * @link https://github.com/directus/directus/discussions/7261#discussioncomment-1296215
 * @link https://docs.directus.io/reference/files.html#advanced
 */
export function getDirectusImage(
  obj: Pick<DirectusFiles, 'id' | 'filename_disk' | 'storage'> | null,
  options?: Options
) {
  if (!obj) return null;
  const assetId = typeof obj === 'string' ? obj : obj.id;
  const q = qs.stringify(options, { addQueryPrefix: true });

  if (obj.storage !== 'r2') {
    return `${env.NEXT_PUBLIC_DIRECTUS_URL}/assets/${assetId}${q}`;
  }

  return '/images/image-placeholder.png'
}

export function getDirectusImageSource(m: DirectusFiles) {
  return {
    src: getDirectusImage(m),
    storage: (m?.storage || 'local')
  };
}
