import { BarChart, Home, LogOut,  Settings, CreditCard, NotebookPen, TrendingDown, User } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { DarkModeToggle } from "./DarkModeToggle"
import Link from "next/link"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
  },
  {
    title: "Plan",
    url: "/plan",
    icon: NotebookPen,
  },
  {
    title: "Transactions",
    url: "/transactions",
    icon: CreditCard,
  },
  {
    title: "Remaining",
    url: "/remaining",
    icon: TrendingDown,
  },
  {
    title: "Insights",
    url: "/insights",
    icon: BarChart,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  return (
    <Sidebar variant="inset"  collapsible="icon">
      <SidebarContent>
        <SidebarGroup className="h-full">
          <SidebarGroupLabel>Budget Brain</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="flex flex-col gap-2">
              <DarkModeToggle />
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
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
            <SidebarMenu>
            <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <Link href="/profile">
                      <User />
                      <span>Profile</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="#">
                      <LogOut />
                      <span>Logout</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
