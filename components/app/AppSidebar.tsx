import { BarChart, Home, Settings, NotebookPen } from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Logo } from '@/components/ui/logo';  
import { AppSidebarMenuItem } from './AppSidebarMenuItem';


const items = [
  {
    title: 'Overview',
    url: '/',
    icon: Home,
  },
  {
    title: 'Plan',
    url: '/plan',
    icon: NotebookPen,
  },
  {
    title: 'Insights',
    url: '/insights',
    icon: BarChart,
  },
];

export function AppSidebar() {


  return (
    <Sidebar
      variant='inset'
      collapsible='icon'
    >
      <SidebarContent>
        <SidebarGroup className='h-full  flex flex-col gap-4'>
          <div className='flex justify-center items-center'>
            <Logo />
          <SidebarGroupLabel className='text-2xl text-foreground font-bold flex justify-center items-center'>
            Budget Brain
          </SidebarGroupLabel>
          </div>
          <SidebarGroupContent>
            <SidebarMenu className='flex flex-col gap-4'>
              {items.map((item) => (
                <AppSidebarMenuItem key={item.title} url={item.url} Icon={item.icon} title={item.title} />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='flex flex-col gap-4'>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className='text-lg font-light'
                  asChild
                >
                  <Link href='/settings'>
                    <Settings />
                    <span>Profile & Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
