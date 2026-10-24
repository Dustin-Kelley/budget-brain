import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Logo } from '@/components/ui/logo';
import { ThemeCycle } from '@/components/shell/ThemeCycle';

const POINTS = [
  {
    title: 'Plan every dollar',
    body: 'Add this month’s income, then give each dollar a group and an item until nothing is left unassigned.',
  },
  {
    title: 'Track spending',
    body: 'Add, edit, and delete transactions by hand. Assign each one to the budget item it belongs to.',
  },
  {
    title: 'See the month',
    body: 'Home shows income, what you budgeted, and what you spent — broken out by group.',
  },
];

export default function LandingPage() {
  return (
    <div className='flex min-h-[100dvh] flex-col bg-[var(--bb-bg)] text-[var(--bb-text)]'>
      <header className='sticky top-0 z-50 w-full border-b border-[var(--bb-line)] bg-[var(--bb-bg)]/90 backdrop-blur-lg'>
        <div className='mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-4 md:px-6'>
          <Link
            href='/welcome'
            className='flex items-center gap-2 font-semibold tracking-[-0.02em] text-[var(--bb-text)] hover:text-[var(--bb-text)] hover:no-underline'
          >
            <Logo />
            Budget Brain
          </Link>
          <div className='flex items-center gap-3'>
            <ThemeCycle />
            <Link
              href='/login'
              className='hover:no-underline'
            >
              <Button size='sm'>
                Sign in
                <ChevronRight className='ml-1 size-4' />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1'>
        <section className='mx-auto w-full max-w-5xl px-4 py-16 md:px-6 md:py-24'>
          <p className='bb-kicker'>Zero-based budget</p>
          <h1 className='mt-3 max-w-[14ch] text-4xl font-semibold tracking-[-0.04em] md:text-6xl'>
            Give every dollar a job.
          </h1>
          <p className='mt-5 max-w-[42ch] text-lg text-[var(--bb-sub)]'>
            Plan the month, track what you spend, and see income next to what
            you budgeted and what you spent.
          </p>
          <div className='mt-8'>
            <Link
              href='/login'
              className='hover:no-underline'
            >
              <Button
                size='lg'
                className='h-12 px-6 text-base'
              >
                Get started
                <ChevronRight className='ml-1 size-4' />
              </Button>
            </Link>
          </div>
        </section>

        <section className='mx-auto grid w-full max-w-5xl gap-4 px-4 pb-20 md:grid-cols-3 md:px-6'>
          {POINTS.map((point) => (
            <article
              key={point.title}
              className='bb-card px-5 py-6'
            >
              <h2 className='text-[17px] font-semibold tracking-[-0.02em]'>
                {point.title}
              </h2>
              <p className='mt-2 text-[14px] leading-relaxed text-[var(--bb-sub)]'>
                {point.body}
              </p>
            </article>
          ))}
        </section>
      </main>

      <footer className='w-full border-t border-[var(--bb-line)]'>
        <div className='mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6'>
          <p className='text-xs text-[var(--bb-dim)]'>
            &copy; {new Date().getFullYear()} Budget Brain. All rights reserved.
          </p>
          <div className='flex gap-4'>
            <Link
              href='/privacy'
              className='text-xs text-[var(--bb-sub)] hover:text-[var(--bb-text)]'
            >
              Privacy Policy
            </Link>
            <Link
              href='/support'
              className='text-xs text-[var(--bb-sub)] hover:text-[var(--bb-text)]'
            >
              Support
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
