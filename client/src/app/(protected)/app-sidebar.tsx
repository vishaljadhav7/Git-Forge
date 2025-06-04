"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, Bot, CreditCard , ChevronUp, User2, Loader2} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenu,
  SidebarFooter,
  useSidebar
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAppSelector , useAppDispatch} from "@/store/hooks";
import { removeUser } from "@/store/features/user/userSlice";
import { useFetchAllProjectsQuery } from "@/store/features/api";
import axios from "axios";

const sidebarItems = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "QnA",
    path: "/qna",
    icon: Bot,
  },
  {
    title: "Billing",
    path: "/billing",
    icon: CreditCard,
  },
];



const AppSidebar = () => {
  const pathName = usePathname();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const userInfo = useAppSelector(store => store.user.userInfo)
  const {open} = useSidebar()
  
  const {data : projects, isLoading} = useFetchAllProjectsQuery();


  const handleLogout = async () => {
   try {
    await axios.post(`${process.env.NEXT_PUBLIC_URL}/api/auth/sign-out`, {}, {
      withCredentials : true
    });
   dispatch(removeUser());
   router.push("/");
   } catch (error) {
    console.error(error)
   }
  }

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center p-2">
          {!open && <span className="text-xl font-bold text-purple-400 ">GF</span>}
         {open && <span className="text-xl font-bold text-slate-900 ">Git Forge</span>}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => {
                return (
                  <SidebarMenuItem key={item.path} className="list-none">
                    <SidebarMenuButton asChild>
                      <Link
                        className={
                          pathName == item.path ? `bg-primary text-white` : ""
                        }
                        href={item.path}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {isLoading ? 
              <Loader2 className="animate-spin text-center ml-6"/>
               :
              <>              
              {projects?.map((project) => {
                return (
                  <SidebarMenuItem key={project.id} className="list-none">
                    <SidebarMenuButton>
                      <Link href={`/project/${project.id}`}  key={project.id}>                      
                      <div className="flex items-center  gap-2">
                        <div
                          className={cn(
                            "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                            {
                              "bg-primary text-white": `/project/${project.id}` === pathName, 
                            }
                          )}
                        >
                          
                            {project.projectName.charAt(0).toUpperCase()}
                        </div>
                        <span>{project.projectName}</span>
                      </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              </>}
            </SidebarMenu> 
            <Button
            className="mt-3" 
            size={"sm"}
            variant={"outline"}
            >
              <Plus/>
              {open && "Create Project"} 
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

         <SidebarFooter className="mb-2 relative">
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu >
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User2 /> {userInfo?.userName}
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  side="top"
                  className="w-[220px] absolute bottom-2"
                >
                  <Link 
                  href={"/billing"}
                  >                  
                  <DropdownMenuItem>
                    <span>Billing</span>
                  </DropdownMenuItem>
                  </Link>

                  <DropdownMenuItem
                  onClick={handleLogout}
                  >
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
