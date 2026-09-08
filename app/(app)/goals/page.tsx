import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { Icon } from '@/components/shell/Icon';
import Link from 'next/link';

export default async function GoalsPage() {
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <div className='flex flex-col gap-5'>
      <div>
        <h1 className='bb-title'>Goals</h1>
        <p className='mt-1.5 text-[14px] text-[var(--bb-sub)]'>
          Savings targets that follow your FOO step. Not live yet.
        </p>
      </div>

      <div className='bb-card flex flex-col items-start gap-4 px-6 py-[28px]'>
        <span className='flex size-12 items-center justify-center rounded-full bg-[var(--bb-cy-tint)] text-[var(--bb-cy-text)]'>
          <Icon
            name='flag'
            size={26}
          />
        </span>
        <div>
          <h2 className='text-[18px] font-semibold tracking-[-0.015em]'>
            Goals land with the FOO journey
          </h2>
          <p className='mt-1.5 max-w-[48ch] text-[14px] text-[var(--bb-sub)]'>
            This page is a placeholder so the home nav matches the mock. Live
            goals and diagnosis are a later step — nothing here is tracking
            your accounts yet.
          </p>
        </div>
        <Link
          href='/'
          className='bb-solid'
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
