import { LoginForm } from '../components/LoginForm';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center px-4 py-10 sm:px-6'>
      <div className='flex w-full max-w-md flex-col items-center gap-8'>
        <Link
          href='/welcome'
          className='flex flex-col items-center gap-2 text-base font-medium'
        >
          <Logo />
          Budget Brain
        </Link>
        <LoginForm className='w-full' />
      </div>
    </div>
  );
}
