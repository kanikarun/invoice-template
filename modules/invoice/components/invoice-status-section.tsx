import { useCallback, useMemo, useState } from 'react';

import { updateInvoiceStatus } from '@/lib/directus';
import { cn } from '@/lib/utils';

import { UseInvoiceProps } from '../hooks/use-invoice';

type Props = { data: UseInvoiceProps };

const translation = {
  en: {
    loading: 'Loading',
    paid: { msg: 'Your invoice is paid.', status: 'Unpaid' },
    pending: { msg: 'Have invoice been paid?', status: 'Paid' }
  },
  km: {
    loading: 'ដំណើការ',
    paid: { msg: 'វិក្កយបត្ររបស់អ្នកត្រូវបានបង់។', status: 'មិនទាន់បង់' },
    pending: { msg: 'តើវិក្កយបត្រត្រូវបានបង់ទេ?', status: 'បានបង់' }
  },
  zh: {
    loading: '加载中',
    paid: { msg: '您的发票已付款。', status: '未付' },
    pending: { msg: '发票已经支付了吗？', status: '有薪酬的' }
  }
};

export const InvoiceStatusSection: React.FC<Props> = ({ data: { authToken, isAuth, invoice, locale } }) => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<InvoiceStatus>((invoice.invoice_status as never) || 'pending');

  const handleClick = useCallback(async () => {
    if (!authToken) return;
    try {
      setLoading(true);
      const newStatus = status === 'pending' ? 'paid' : 'pending';
      const i = await updateInvoiceStatus(authToken, invoice.id, newStatus);
      if (!i.invoice_status) return;
      setStatus(i.invoice_status as never);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Update Invoice Status:', error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const memo = useMemo(() => {
    const t = translation[locale];
    return { loading: t.loading, ...t[status] };
  }, [status]);

  if (!isAuth) return null;

  return (
    <div className="absolute bottom-16 left-1/2 w-full max-w-4xl -translate-x-1/2">
      <div className="mx-4 flex items-center justify-between rounded-md border bg-white p-2 text-sm shadow dark:bg-mobile-dark">
        <div className="pl-1">{memo?.msg}</div>
        <Button //
          label={memo?.status}
          loading={loading}
          loadingLabel={memo.loading}
          status={status}
          onClick={handleClick}
        />
      </div>
    </div>
  );
};

interface ButtonProps {
  onClick: () => void;
  status: InvoiceStatus;
  loading?: boolean;
  loadingLabel: string;
  label: string;
}

const Button: React.FC<ButtonProps> = ({ label, loading, loadingLabel, status, onClick }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={cn('border-lg rounded border px-2 py-1 font-medium disabled:opacity-50', {
      'border-green-600 bg-green-100 text-green-600': status === 'pending',
      'border-amber-600 bg-amber-100 text-amber-600': status === 'paid'
    })}
  >
    {loading ? loadingLabel : label}
  </button>
);
