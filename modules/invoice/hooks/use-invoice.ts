'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ROUTES } from '@/config/routes';

import type { BaseInvoiceDocumentData } from '../documents';

export type InvoiceType =
  | 'bold-stripe'
  | 'bold-stripe-intl'
  | 'bold-stripe-picture'
  | 'bold-stripe-picture-intl'
  | 'default'
  | 'picture'
  | 'thin-stripe'
  | 'thin-stripe-intl'
  | 'thin-stripe-picture'
  | 'thin-stripe-picture-intl'
  | 'thermal'
  | 'thermal-80'
  | 'thermal-50'
  | 'thermal-50-en'
  | 'thermal-50-km'
  | 'khmer-tax'
  | 'foodie-intl'
  | 'foodie'
  | 'cosmetic-intl';

export interface UseInvoiceProps extends BaseInvoiceDocumentData {
  authToken?: string;
  hashId: string;
  isAuth?: boolean;
  invoiceType?: InvoiceType | null;
  locale: Locale;
}

export function useInvoice({ hashId, invoiceType, isAuth, locale }: UseInvoiceProps) {
  const [type, setType] = useState<InvoiceType>(invoiceType || 'default');

  const url = useMemo(() => ROUTES.INVOICES_DOWNLOAD$(hashId, type, locale), [type]);

  const updateInvoiceType = useCallback((val: InvoiceType) => {
    if (!isAuth) return;
    setType(val);
    localStorage.setItem('INVOICE_TYPE', val);
  }, []);

  // ! Get default invoice from admin
  useEffect(() => {
    if (!isAuth) return;

    const val = localStorage.getItem('INVOICE_TYPE') as InvoiceType | null;
    if (!val) return;
    setType(val);
  }, []);

  return { url, type, updateInvoiceType };
}
