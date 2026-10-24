import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/app/queries/getCurrentUser';
import { getBudgetMonth } from '@/app/queries/getBudgetMonth';
import { ensureBudgetDefaults } from '@/app/mutations/ensureBudgetDefaults';
import { Skeleton } from '@/components/ui/skeleton';
import { HomeView } from '@/components/home/HomeView';

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const { month } = await searchParams;
  const { currentUser } = await getCurrentUser();

  if (!currentUser) redirect('/welcome');

  return (
    <Suspense
      key={month ?? 'current'}
      fallback={<HomeSkeleton />}
    >
      <HomeBody month={month} />
    </Suspense>
  );
}

async function HomeBody({ month }: { month: string | undefined }) {
  await ensureBudgetDefaults(month);
  const budget = await getBudgetMonth(month);

  return <HomeView budget={budget} />;
}

function HomeSkeleton() {
  return (
    <div className='flex flex-col gap-[18px]'>
      <Skeleton className='h-[280px] rounded-2xl' />
    </div>
  );
}
