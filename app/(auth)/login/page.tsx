import { GalleryVerticalEnd } from 'lucide-react';
import { LoginForm } from '../components/LoginForm';
export default function Page() {
  return (
    <div className='flex min-h-svh flex-col items-center justify-center gap-6  p-6 md:p-10'>
      <div className='flex w-full items-center justify-center max-w-sm flex-col gap-6'>
        <div className='flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground'>
          <GalleryVerticalEnd className='size-4' />
        </div>
        Budget Brain <LoginForm />
      </div>
    </div>
  );
}
