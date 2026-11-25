import { LoginForm } from '../components/LoginForm';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';

export default function Page() {
  return (
    <div className='bb-safe-screen flex min-h-svh flex-col items-center justify-center'>
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
