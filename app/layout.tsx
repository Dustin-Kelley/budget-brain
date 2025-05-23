import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';

import './globals.css';
import { SidebarProvider } from '@/components/ui/sidebar';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';
import { SidebarWrapper } from '@/components/app/SidebarWrapper';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Budget Brain',
  description: 'Budget Brain is a tool that helps you manage your money',
  icons: {
    icon: 'https://gsilpsppthrhhqcuwzjw.supabase.co/storage/v1/object/public/logos//budget_brain_favicon.ico',
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      suppressHydrationWarning
    >
      <head>
        <link
          rel='manifest'
          href='/manifest.json'
        />
        <link
          rel='apple-touch-icon'
          href='/icons/budget-brain-pwa-logo.png'
        />
        <link
          rel='icon'
          href='/icons/budget-brain-pwa-logo.png'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute='class'
          defaultTheme='light'
          enableSystem
          disableTransitionOnChange
        >
          <SidebarProvider>
            <SidebarWrapper>
              {children}
              <Toaster richColors />
            </SidebarWrapper>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
