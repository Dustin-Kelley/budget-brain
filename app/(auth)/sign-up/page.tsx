import { SignUpForm } from '../components/SignUpForm';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10'>
      <div className='flex w-full max-w-sm flex-col gap-6'>
        <Link
          href='/welcome'
          className='flex flex-col items-center gap-2 font-medium'
        >
          <Logo />
          Budget Brain
        </Link>
        <SignUpForm />
      </div>
    </div>
  );
}
