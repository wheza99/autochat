"use client"

import { useEffect, useState } from "react"
import {
  Folder,
  MoreHorizontal,
  Share,
  Trash2,
  Bot,
  type LucideIcon,
} from "lucide-react"

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
import { supabase } from "@/lib/supabase"

interface Agent {
  id: string
  name: string
  phone: number | null
  system_prompt: string | null
  model: string | null
  created_at: string
  updated_at: string | null
}

export function NavProjects() {
  const { isMobile } = useSidebar()
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchAgents() {
      try {
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching agents:', error)
          return
        }

        setAgents(data || [])
      } catch (error) {
        console.error('Error fetching agents:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAgents()
  }, [])

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Agents</SidebarGroupLabel>
      <SidebarMenu>
        {loading ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Bot />
              <span>Loading agents...</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : agents.length === 0 ? (
          <SidebarMenuItem>
            <SidebarMenuButton disabled>
              <Bot />
              <span>No agents found</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ) : (
          agents.map((agent) => (
            <SidebarMenuItem key={agent.id}>
              <SidebarMenuButton asChild>
                <a href={`/dashboard/agents/${agent.id}`}>
                  <Bot />
                  <span>{agent.name || 'Unnamed Agent'}</span>
                </a>
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
