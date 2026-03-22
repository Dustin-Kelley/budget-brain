'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Logo } from '@/components/ui/logo';

export default function LandingPage() {
  const appStoreLink = 'https://apps.apple.com/us/app/budget-brain/id6760318175';

  return (
    <div className='flex min-h-[100dvh] flex-col'>
      {/* Header */}
      <header className='sticky top-0 z-50 w-full backdrop-blur-lg bg-background/80 border-b'>
        <div className='container flex h-16 items-center justify-between'>
          <Link
            href='/welcome'
            className='flex items-center gap-2 font-medium'
          >
            <Logo />
            Budget Brain
          </Link>
          <div className='flex gap-3 items-center'>
            <Link href='/login'>
              <Button variant='ghost' size='sm'>
                Log in
              </Button>
            </Link>
            <Link href='/sign-up'>
              <Button size='sm' className='rounded-full'>
                Sign up
                <ChevronRight className='ml-1 size-4' />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className='flex-1 flex flex-col items-center justify-center'>
        {/* Hero */}
        <section className='w-full py-20 md:py-32 lg:py-40'>
          <div className='container px-4 md:px-6'>
            <div className='flex flex-col lg:flex-row items-center gap-12 lg:gap-20'>
              {/* Copy */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className='flex-1 text-center lg:text-left'
              >
                <Badge
                  className='mb-4 rounded-full px-4 py-1.5 text-sm font-medium'
                  variant='secondary'
                >
                  Now Available on iOS
                </Badge>
                <h1 className='text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70'>
                  Budgeting made simple.
                </h1>
                <p className='text-lg md:text-xl text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0'>
                  Track spending, set goals, and build better financial habits
                  — all from your iPhone.
                </p>
                <div className='flex flex-col sm:flex-row gap-3 justify-center lg:justify-start'>
                  <Link href={appStoreLink}>
                    <Button
                      size='lg'
                      className='rounded-full h-12 px-6 text-base gap-2'
                    >
                      <svg
                        viewBox='0 0 24 24'
                        className='size-5 fill-current'
                        xmlns='http://www.w3.org/2000/svg'
                      >
                        <path d='M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z' />
                      </svg>
                      App Store
                    </Button>
                  </Link>
                  <Link href='/sign-up'>
                    <Button
                      size='lg'
                      variant='outline'
                      className='rounded-full h-12 px-6 text-base'
                    >
                      Create an account
                    </Button>
                  </Link>
                </div>
              </motion.div>

              {/* iPhone Mockup */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className='flex-shrink-0'
              >
                <div className='relative mx-auto w-[260px] md:w-[300px]'>
                  <div className='relative rounded-[3rem] border-[8px] border-foreground/90 bg-black shadow-2xl overflow-hidden aspect-[9/19.5]'>
                    <div className='absolute top-2 left-1/2 -translate-x-1/2 w-[90px] h-[28px] bg-black rounded-full z-20'></div>
                    <Image
                      src='/icons/app-screenshot.png'
                      alt='Budget Brain app screenshot'
                      fill
                      className='object-cover object-top'
                      priority
                    />
                  </div>
                  <div className='absolute -bottom-6 -right-6 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-primary/30 to-secondary/30 blur-3xl opacity-70'></div>
                  <div className='absolute -top-6 -left-6 -z-10 h-[200px] w-[200px] rounded-full bg-gradient-to-br from-secondary/30 to-primary/30 blur-3xl opacity-70'></div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className='w-full border-t'>
        <div className='container flex flex-col sm:flex-row justify-between items-center gap-4 px-4 py-6 md:px-6'>
          <p className='text-xs text-muted-foreground'>
            &copy; {new Date().getFullYear()} Budget Brain. All rights reserved.
          </p>
          <div className='flex gap-4'>
            <Link
              href='#'
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              Privacy Policy
            </Link>
            <Link
              href='#'
              className='text-xs text-muted-foreground hover:text-foreground transition-colors'
            >
              Terms of Service
            </Link>
          </div>
          <section className='flex flex-col gap-4 sm:flex-row justify-between items-center border-t border-border/40 pt-8'>
            <p className='text-xs text-muted-foreground'>
              &copy; {new Date().getFullYear()} Budget Brain. All rights
              reserved.
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
          </section>
        </div>
      </footer>
    </div>
  );
}
