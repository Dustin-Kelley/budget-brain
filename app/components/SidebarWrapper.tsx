'use client';

import { usePathname } from 'next/navigation';
import { SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { BreadcrumbNav } from './BreadcrumbNav';

export function SidebarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // Define routes where sidebar should be hidden
  const hideSidebarRoutes = ['/landing', '/sign-in', '/sign-up'];
  const shouldHideSidebar = hideSidebarRoutes.some(route => pathname.startsWith(route));

  if (shouldHideSidebar) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <BreadcrumbNav />
        </header>
        {children}
      </SidebarInset>
    </>
  );
} 