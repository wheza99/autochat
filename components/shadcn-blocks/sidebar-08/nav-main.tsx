// Komponen navigasi utama sidebar
"use client"

import { type LucideIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAgent } from "@/contexts/agent-context"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
    badge?: string
  }[]
}) {
  const { selectedAgent } = useAgent();
  const router = useRouter();

  const handleNavigation = (url: string) => {
    if (selectedAgent) {
      router.push(`${url}?agent_id=${selectedAgent.id}`);
    } else {
      router.push(url);
    }
  };

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton 
              onClick={() => handleNavigation(item.url)}
              tooltip={item.title}
            >
              <item.icon />
              <span>{item.title}</span>
              {item.badge && (
                <span className="ml-auto text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
