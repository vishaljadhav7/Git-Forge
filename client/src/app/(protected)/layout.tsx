'use client'
import React from "react";
import { SidebarProvider , SidebarTrigger} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppSelector } from "@/store/hooks";
import AppSidebar from "./app-sidebar";

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {

  const {userInfo} = useAppSelector(store => store.user)

  return (
    <SidebarProvider>
      {<AppSidebar/>}
      <main className="w-full m-1">
           <SidebarTrigger />
        <div className="flex items-center gap-2 border-sidebar-border bg-border shadow rounded-md p-2 px-4">
          {/* {<SearchBar/>} */}
          <div className="ml-auto"></div>
          <Avatar>
            <AvatarImage src={userInfo?.profilePic} />
            <AvatarFallback>{userInfo?.userName}</AvatarFallback>
          </Avatar>
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-[calc(100vh-4rem)] p-4">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
