import { createEnv } from '@t3-oss/env-nextjs';
import * as v from 'valibot';

const IsRequiredString = v.pipe(v.string(), v.minLength(1));

export const env = createEnv({
  server: {
    NEXT_DIRECTUS_TOKEN: IsRequiredString,
  },
  client: {
    NEXT_PUBLIC_SITE_URL: IsRequiredString,
    NEXT_PUBLIC_DIRECTUS_URL: IsRequiredString,
  },
  runtimeEnv: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_DIRECTUS_URL: process.env.NEXT_PUBLIC_DIRECTUS_URL,
    NEXT_DIRECTUS_TOKEN: process.env.NEXT_DIRECTUS_TOKEN,
  }
});
