import { LoginForm } from '../components/LoginForm';
import { Logo } from '@/components/ui/logo';
import Link from 'next/link';
export default function Page() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10'>
      <div className='flex w-full items-center justify-center max-w-sm flex-col gap-6'>
        <Link href="/welcome" className='flex flex-col items-center gap-2 font-medium'>
        <Logo />
        Budget Brain
        </Link>
        <LoginForm />
      </div>
    </div>
  );
}
