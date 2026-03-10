import Link from 'next/link';
import { Mail } from 'lucide-react';
import { Logo } from '@/components/ui/logo';

export default function SupportPage() {
  return (
    <div className='flex min-h-[100dvh] flex-col'>
      <header className='sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b'>
        <div className='container flex h-16 items-center'>
          <Link
            href='/welcome'
            className='flex items-center gap-2 font-medium'
          >
            <Logo />
            Budget Brain
          </Link>
        </div>
      </header>

      <main className='flex-1 container max-w-2xl px-4 py-12 md:py-20'>
        <h1 className='text-3xl md:text-4xl font-bold tracking-tight mb-4'>
          Support
        </h1>
        <p className='text-lg text-muted-foreground mb-10'>
          Need help with Budget Brain? We&apos;re here for you.
        </p>

        <div className='rounded-xl border bg-card p-6 md:p-8'>
          <div className='flex items-start gap-4'>
            <div className='size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0'>
              <Mail className='size-5' />
            </div>
            <div>
              <h2 className='text-lg font-semibold mb-1'>Email Us</h2>
              <p className='text-muted-foreground mb-3'>
                For questions, bug reports, or account requests (including data
                deletion), send us an email and we&apos;ll get back to you as
                soon as possible.
              </p>
              <a
                href='mailto:support@budgetbrain.app'
                className='text-primary font-medium underline underline-offset-4 hover:text-primary/80'
              >
                support@budgetbrain.app
              </a>
            </div>
          </div>
        </div>
      </main>

      <footer className='w-full border-t'>
        <div className='container flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-6 md:px-6'>
          <p className='text-xs text-muted-foreground'>
            &copy; {new Date().getFullYear()} Budget Brain. All rights reserved.
          </p>
          <div className='flex gap-4'>
            <Link
              href='/privacy'
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='/support'
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
