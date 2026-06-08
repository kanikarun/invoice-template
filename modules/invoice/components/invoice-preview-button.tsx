import { IconPrinter } from '@tabler/icons-react';

import { Button } from '@/components/ui/button';

const translation = {
  en: 'Print',
  km: 'ព្រីន',
  zh: '打印'
};

interface Props {
  locale: Locale;
  onClick: () => void;
}
export const InvoicePreview: React.FC<Props> = ({ locale, onClick }) => {
  return (
    <Button onClick={onClick} className="max-sm:size-9 [&>span]:max-sm:hidden">
      <IconPrinter stroke={2} /> <span>{translation[locale]}</span>
    </Button>
  );
};
