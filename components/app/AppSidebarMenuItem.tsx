'use client';

import { SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { LucideProps } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isActive = pathname === url;
  const { setOpenMobile } = useSidebar();
  return (
    <SidebarMenuItem key={title}>
    <SidebarMenuButton
      className={cn('text-lg font-medium', isActive && 'bg-primary text-white')}
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