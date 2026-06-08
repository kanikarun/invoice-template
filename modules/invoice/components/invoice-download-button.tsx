import { IconDownload } from '@tabler/icons-react';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { downloadFile } from '@/utils/download-file';

const translation = {
  en: {
    loading: 'Downloading',
    download: 'Download'
  },
  km: {
    loading: 'ដំណើការ',
    download: 'ទាញយក'
  },
  zh: {
    loading: '加载中',
    download: '下载'
  }
};

interface Props {
  locale: Locale;
  url: string;
}

export const InvoiceDownloadLink: React.FC<Props> = ({ locale, url }) => {
  const [isClicked, setIsClicked] = useState(false);

  function download() {
    if (!isClicked) {
      setIsClicked(true);
      downloadFile(url);
      setTimeout(() => setIsClicked(false), 2000);
    }
  }

  const t = translation[locale];

  return (
    <Button onClick={download} disabled={isClicked} className="max-sm:size-9 [&>span]:max-sm:hidden">
      <IconDownload stroke={2} /> <span>{isClicked ? t.loading : t.download}</span>
    </Button>
  );
};
