// Komponen switcher untuk memilih agent berdasarkan user yang login
"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Bot, Plus } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useAgent } from "@/contexts/agent-context"
import { useAuth } from "@/hooks/use-auth"

export function AppSwitcher() {
  const { agents, selectedAgent, setSelectedAgent } = useAgent()
  const { user } = useAuth()
  
  const currentAgent = selectedAgent || (agents.length > 0 ? agents[0] : null)

  if (!user) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Bot className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">No User</span>
              <span className="truncate text-xs">Please login</span>
            </div>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    )
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Bot className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  {currentAgent ? currentAgent.name : 'No Agents'}
                </span>
                <span className="truncate text-xs">
                  {currentAgent ? (currentAgent.model || 'No Model') : 'Create an agent'}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="right"
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Your Agents
            </DropdownMenuLabel>
            {agents.length === 0 ? (
              <DropdownMenuItem disabled className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Bot className="size-4 shrink-0" />
                </div>
                No agents found
              </DropdownMenuItem>
            ) : (
              agents.map((agent) => (
                <DropdownMenuItem
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="gap-2 p-2"
                >
                  <div className="flex size-6 items-center justify-center rounded-sm border">
                    <Bot className="size-4 shrink-0" />
                  </div>
                  {agent.name}
                  <div className="ml-auto flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">
                      {agent.model || 'No Model'}
                    </div>
                    {selectedAgent?.id === agent.id && (
                      <Check className="size-4" />
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="gap-2 p-2" disabled>
              <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                <Plus className="size-4" />
              </div>
              <div className="font-medium text-muted-foreground">Add agent</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}