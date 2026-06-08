export const ROUTES = {
  INVOICES$: (id: string) => `/invoices/${id}`,
  INVOICES_DOWNLOAD$: (id: string, type?: string, locale?: string) =>
    `/invoices/${id}/download?type=${type}&locale=${locale || 'en'}`
} as const;
