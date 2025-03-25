'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from "@/components/ui/breadcrumb"

export function BreadcrumbNav() {
  const pathname = usePathname()
  
  // Get the path segments and create breadcrumb items
  const segments = pathname.split('/').filter(Boolean)
  const pageName = segments.length === 0 ? 'Dashboard' : 
    segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase())
  
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
} 