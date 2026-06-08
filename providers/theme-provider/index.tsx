'use client';

import { ThemeProvider as NextThemesProvider } from 'next-themes';

export function ThemeProvider({ children }: React.PropsWithChildren) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme='light'
      forcedTheme='light'
      disableTransitionOnChange
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
