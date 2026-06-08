import * as v from 'valibot';

// const REGEX_PHONE = /^([+]?(\d{9,15}))$/;
const REGEX_PHONE = /^(?:0\d{8,14}|[1-9]\d{7,14})$/;

export const isOptionalStringMaxLength = (maxLength: number) =>
  v.optional(v.nullable(v.pipe(v.string(), v.maxLength(maxLength))));

export const isRequiredPhone = (m: string, n: string) => v.pipe(v.string(m), v.nonEmpty(m), v.regex(REGEX_PHONE, n));
export const isRequiredString = (m: string) => v.pipe(v.nonNullable(v.string(m)), v.nonEmpty(m));
export const isRequiredStringLength = (m: string, minLength: number) => v.pipe(v.string(m), v.minLength(minLength, m));
