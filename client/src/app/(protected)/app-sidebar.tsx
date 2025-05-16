"use client";

import React from "react";
import { LayoutDashboard, Bot, CreditCard } from "lucide-react";
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
  SidebarFooter
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
import { Github, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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

const allProjects = [
  {
    id: 1,
    name: "Project 1",
  },
  {
    id: 2,
    name: "Project 2",
  },
  {
    id: 3,
    name: "Project 3",
  },
];

const AppSidebar = () => {
  const pathName = usePathname();
  const projectId = 1;
  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="flex items-center  p-2">
          <Github className="w-6 h-6 mr-2 text-purple-600 " />
          <span className="text-xl font-bold text-slate-900 ">Git Forge</span>
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
              {allProjects.map((project) => {
                return (
                  <SidebarMenuItem key={project.id} className="list-none">
                    <SidebarMenuButton>
                      <div className="flex items-center  gap-2">
                        <div
                          key={project.id}
                          className={cn(
                            "rounded-sm border size-6 flex items-center justify-center text-sm bg-white text-primary",
                            {
                              "bg-primary text-white": projectId === project.id,
                            }
                          )}
                        >
                            {project.id}
                        </div>
                        <span>{project.name}</span>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu> 
            <Button
            className="mt-3" 
            size={"sm"}
            variant={"outline"}
            >
              <Plus/>
              Create Project 
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
       Footer
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
