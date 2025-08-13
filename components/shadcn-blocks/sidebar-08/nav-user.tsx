// Komponen navigasi user dengan dropdown menu profil dan logout
"use client"

import {
  Bell,
  ChevronsUpDown,
  CreditCard,
  LifeBuoy,
  LogOut,
  Send,
  User,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuth } from "@/hooks/use-auth"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
  }
}) {
  const { isMobile } = useSidebar()
  const { signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      // Set logout cookie to indicate logout in progress
      document.cookie = 'logout-in-progress=true; path=/; max-age=10'
      
      const { error } = await signOut()
      if (error) {
        toast.error('Logout failed: ' + error.message)
        // Clear logout cookie on error
        document.cookie = 'logout-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
      } else {
        toast.success('Logout successful!')
        // Clear all auth-related cookies
        const cookiesToClear = [
          'client-auth-status',
          'sb-access-token',
          'supabase-auth-token',
          'sb-refresh-token',
          'supabase-refresh-token'
        ]
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        })
        
        // Clear any supabase cookies that might exist
        document.cookie.split(';').forEach(cookie => {
          const cookieName = cookie.split('=')[0].trim()
          if (cookieName.includes('supabase') && cookieName.includes('token')) {
            document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        })
        
        // Redirect to home page (middleware will handle this)
        router.push('/')
      }
    } catch {
      toast.error('An error occurred during logout')
      // Clear logout cookie on error
      document.cookie = 'logout-in-progress=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    }
  }

  // Generate initials from name for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2)
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
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback className="rounded-lg">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user.name}</span>
                  <span className="truncate text-xs">{user.email}</span>
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/billing')}>
                <CreditCard />
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Bell />
                Notifications
              </DropdownMenuItem>
              <DropdownMenuItem>
                <LifeBuoy />
                Support
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Send />
                Feedback
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
