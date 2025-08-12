// Komponen navigasi untuk menampilkan dan mengelola daftar agent
"use client"

import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  Bot,
} from "lucide-react"
import { useAgent } from "@/contexts/agent-context"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavProjects() {
  const { isMobile } = useSidebar()
  const { agents, selectedAgent, setSelectedAgent } = useAgent()

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Agents</SidebarGroupLabel>
      <SidebarMenu>
        {agents.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Bot />
              <span>No agents found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          agents.map((agent) => (
            <SidebarMenuItem key={agent.id}>
              <SidebarMenuButton 
                onClick={() => setSelectedAgent(agent)}
                isActive={selectedAgent?.id === agent.id}
              >
                <Bot />
                <span>{agent.name || 'Unnamed Agent'}</span>
              </SidebarMenuButton>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuAction showOnHover>
                    <MoreHorizontal />
                    <span className="sr-only">More</span>
                  </SidebarMenuAction>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  className="w-48"
                  side={isMobile ? "bottom" : "right"}
                  align={isMobile ? "end" : "start"}
                >
                  <DropdownMenuItem>
                    <Folder className="text-muted-foreground" />
                    <span>View Agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Share className="text-muted-foreground" />
                    <span>Share Agent</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Trash2 className="text-muted-foreground" />
                    <span>Delete Agent</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ))
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
