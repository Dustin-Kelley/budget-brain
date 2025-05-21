'use client';

import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import { ForwardRefExoticComponent, RefAttributes } from "react";

export function AppSidebarMenuItem({
  title,
  Icon,
  url,
}: {
  title: string;
  Icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>
  url: string;
}) {
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem key={title}>
    <SidebarMenuButton
      className='text-lg font-medium'
      asChild
    >
      <Link onClick={() => setOpenMobile(false)} href={url}>
        <Icon />
        <span>{title}</span>
      </Link>
    </SidebarMenuButton>
  </SidebarMenuItem>
  );
} 