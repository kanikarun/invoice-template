import short from 'short-uuid';

const translator = short();
const translator_invoice = short('0123456789');

export function encode(uuid: string) {
  return translator.fromUUID(uuid);
}

export function decode(uuid: string) {
  return translator.toUUID(uuid);
}

// Used for invoice

export function encode_invoice(uuid: string) {
  return translator_invoice.fromUUID(uuid);
}

export function decode_invoice(uuid: string) {
  return translator_invoice.toUUID(uuid);
}
