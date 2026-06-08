'use client';

import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/print/lib/styles/index.css';

import { LoadError, SpecialZoomLevel, Viewer, Worker } from '@react-pdf-viewer/core';
import { printPlugin } from '@react-pdf-viewer/print';
import { useState } from 'react';

import { cn } from '@/lib/utils';

import { useInvoice, UseInvoiceProps } from '../hooks/use-invoice';
import { InvoiceDownloadLink } from './invoice-download-button';
import { InvoicePreview } from './invoice-preview-button';
import { InvoiceStatusSection } from './invoice-status-section';

type Props = UseInvoiceProps;

export const InvoiceForm: React.FC<Props> = props => {
  const { locale } = props;
  const [error, setError] = useState(false);
  const { url } = useInvoice(props);

  const printPluginInstance = printPlugin();
  const { Print } = printPluginInstance;

  return (
    <div className="relative bg-white dark:bg-mobile-dark">
      <div className="container flex h-dvh flex-col border">
        <div className="flex-1 overflow-hidden">
          {/* Must use es5 and this specific version build to support older safari browser */}
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
            <Viewer
              theme={props.theme}
              fileUrl={url}
              plugins={[printPluginInstance]}
              defaultScale={SpecialZoomLevel.PageWidth}
              renderError={e => {
                setError(true);
                return <ErrorMessage {...e} />;
              }}
            />
          </Worker>
        </div>

        <div className="border-t bg-white dark:bg-mobile-dark">
          <div className="flex w-full items-center justify-between p-2 sm:px-8 sm:py-4">
            <div className={cn('flex space-x-2', { invisible: error })}>
              <Print>{p => <InvoicePreview locale={locale} onClick={p.onClick} />}</Print>
              <InvoiceDownloadLink locale={locale} url={url} />
            </div>
          </div>
        </div>
      </div>

      <InvoiceStatusSection data={props} />
    </div>
  );
};

/**
 * @link https://react-pdf-viewer.dev/examples/customize-error-renderer/
 */
const ErrorMessage = (error: LoadError) => {
  let message = '';
  switch (error.name) {
    case 'InvalidPDFException':
      message = 'The document is invalid or corrupted';
      break;
    case 'MissingPDFException':
      message = 'The document is missing';
      break;
    case 'UnexpectedResponseException':
      message = 'Unexpected server response';
      break;
    default:
      message = 'Cannot load the document';
      break;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <div className="rounded bg-red-600 p-2 text-white">{message}</div>
    </div>
  );
};
