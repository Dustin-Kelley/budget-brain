import { Brain } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
export default function Page() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10'>
      <div className='flex w-full items-center justify-center max-w-sm flex-col gap-6'>
        <div className='flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground'>
          <Brain className='size-8' />
        </div>
        Budget Brain
        <LoginForm />
      </div>
    </div>
  );
}
