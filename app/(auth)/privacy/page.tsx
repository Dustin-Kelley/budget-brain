import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function PrivacyPolicyPage() {
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

      <main className='flex-1 container max-w-3xl px-4 py-12 md:py-20'>
        <h1 className='text-3xl md:text-4xl font-bold tracking-tight mb-2'>
          Privacy Policy
        </h1>
        <p className='text-sm text-muted-foreground mb-10'>
          Last updated: March 10, 2026
        </p>

        <div className='prose prose-neutral max-w-none space-y-8 text-foreground'>
          <section>
            <h2 className='text-xl font-semibold mb-3'>Introduction</h2>
            <p className='text-muted-foreground leading-relaxed'>
              Budget Brain (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;)
              is committed to protecting your privacy. This Privacy Policy
              explains how we collect, use, and safeguard your information when
              you use our mobile application and related services.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              Information We Collect
            </h2>
            <p className='text-muted-foreground leading-relaxed mb-3'>
              We collect the following information to provide and improve our
              service:
            </p>
            <ul className='list-disc pl-6 space-y-2 text-muted-foreground'>
              <li>
                <strong className='text-foreground'>Email address</strong> —
                used for authentication and account communication.
              </li>
              <li>
                <strong className='text-foreground'>
                  First and last name
                </strong>{' '}
                (optional) — used to personalize your experience.
              </li>
              <li>
                <strong className='text-foreground'>Household membership</strong>{' '}
                — used to associate your account with a household for shared
                budgeting.
              </li>
              <li>
                <strong className='text-foreground'>Budget data</strong> —
                including income, expenses, categories, and transactions you
                create within the app.
              </li>
            </ul>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>Authentication</h2>
            <p className='text-muted-foreground leading-relaxed'>
              Budget Brain uses passwordless email authentication (magic
              link/one-time code). We do not store passwords. Authentication is
              handled securely through our authentication provider.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              How We Store Your Data
            </h2>
            <p className='text-muted-foreground leading-relaxed'>
              Your data is stored in a PostgreSQL database hosted on Supabase
              (powered by AWS infrastructure). We use industry-standard security
              measures to protect your data, including encryption in transit and
              at rest.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              Third-Party Data Sharing
            </h2>
            <p className='text-muted-foreground leading-relaxed'>
              We do not sell, trade, or share your personal data with third
              parties. Your financial data is yours — we will never monetize it.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              Error Tracking &amp; Analytics
            </h2>
            <p className='text-muted-foreground leading-relaxed'>
              We use Sentry for error tracking and crash reporting. Sentry may
              collect device information and crash data to help us identify and
              fix issues. This data is used solely for improving app stability
              and is not used for advertising or profiling.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              Data Deletion &amp; Account Removal
            </h2>
            <p className='text-muted-foreground leading-relaxed'>
              You can request deletion of your account and all associated data at
              any time by contacting us at{' '}
              <a
                href='mailto:support@budgetbrain.app'
                className='text-primary underline underline-offset-4 hover:text-primary/80'
              >
                support@budgetbrain.app
              </a>
              . We will process your request and permanently delete your data
              within 30 days.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>
              Changes to This Policy
            </h2>
            <p className='text-muted-foreground leading-relaxed'>
              We may update this Privacy Policy from time to time. We will notify
              you of any changes by updating the &quot;Last updated&quot; date at
              the top of this page.
            </p>
          </section>

          <section>
            <h2 className='text-xl font-semibold mb-3'>Contact Us</h2>
            <p className='text-muted-foreground leading-relaxed'>
              If you have any questions about this Privacy Policy, please contact
              us at{' '}
              <a
                href='mailto:support@budgetbrain.app'
                className='text-primary underline underline-offset-4 hover:text-primary/80'
              >
                support@budgetbrain.app
              </a>
              .
            </p>
          </section>
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
