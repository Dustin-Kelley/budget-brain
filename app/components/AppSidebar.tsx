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
import LogoutButton from './LogoutButton';

// Menu items.
const items = [
  {
    title: 'Dashboard',
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
        <SidebarGroup className='h-full  flex flex-col gap-8'>
          <SidebarGroupLabel className='text-1xl text-gray-800 font-bold'>
            Budget Brain 🧠
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className='flex flex-col gap-4'>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className='text-xl font-light'
                    asChild
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className='flex flex-col gap-4'>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className='text-xl'
                  asChild
                >
                  <Link href='/settings'>
                    <Settings />
                    <span>Profile & Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  className='text-xl'
                  asChild
                >
                  <LogoutButton />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
