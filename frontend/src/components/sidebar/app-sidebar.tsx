
import * as React from "react"
// import { NavUser } from "@/components/sidebar/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { Moon, Sun } from "lucide-react"
import { Switch } from "../ui/switch"
import CreateNewChat from "../chat/CreateNewChat"
import NewGroupChatModel from "../chat/NewGroupChatModel"
import GroupChatList from "../chat/GroupChatList"
import AddFriendModel from "../chat/AddFriendModel"
import DirectMessageList from "../chat/DirectMessageList"
import { useThemeStore } from "../../stores/useThemeStore"
import { useAuthStore } from "../../stores/useAuthStore"
import { NavUser } from "./nav-user"
import { useChatStore } from "../../stores/useChatStore"
import ConversationSkeleton from "../skeleton/ConversationSkeleton"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { isDark, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();
  const { conversationLoading } = useChatStore();

  return (
    <Sidebar variant="inset" {...props}>
      
      { /* HEADER */}
      <SidebarHeader>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild className="bg-gradient-primary">
              <a href="#">
                <div className=" flex w-full items-center px-2 justify-between">
                  <h1 className="text-xl font-bold text-white">Moji</h1>
                  <div className="flex items-center gap-2">
                    <Sun className="size-4 text-white/80"/>
                    <Switch checked={isDark} onCheckedChange={toggleTheme} className="data-[state=checked]:bg-background/80"/>
                    <Moon className="size-4 text-white/80"/>
                  </div>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

      </SidebarHeader>

      { /* CONTENT */}
      <SidebarContent className="beautiful-scrollbar">

        <SidebarGroup>
          <SidebarGroupContent>
            <CreateNewChat/>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <div className="flex items-center justify-between">
            <SidebarGroupLabel className="uppercase">Groups</SidebarGroupLabel>
            <NewGroupChatModel/>
          </div>

          <SidebarGroupContent>
            {
              conversationLoading ? <ConversationSkeleton/> : <GroupChatList/>
            }
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="uppercase">Friends</SidebarGroupLabel>

          <SidebarGroupAction title="Add friend" className="cursor-pointer">
            <AddFriendModel/>
          </SidebarGroupAction>

          <SidebarGroupContent>
            {
              conversationLoading ? <ConversationSkeleton/> : <DirectMessageList/>
            }
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      { /* FOOTER */}
      <SidebarFooter>

        { user && <NavUser user={ user } /> }

      </SidebarFooter>
    </Sidebar>
  )
}
