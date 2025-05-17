'use client'

import React, { useState } from "react";
import { SidebarProvider , SidebarTrigger} from "@/components/ui/sidebar";
import AppSidebar from "./app-sidebar";
import { useEffect } from "react";
import { useAppSelector } from "@/store/hooks";
import { useRouter } from "next/navigation";
import { Loader } from "lucide-react";


const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
 const authStatus = useAppSelector(store => store.user.isAuthenticated);
 const [loading, setLoading] = useState<boolean>(true)
 const router = useRouter();

 useEffect(()=>{
  if(authStatus){
    router.push("/")
  }else{
    setLoading(false)
  }
 }, [router, authStatus])
 
 if(loading){
  return ( 
  <div className="w-screen h-screen flex justify-center items-center">
     <Loader className="animate-spin"/>
  </div>
 )
 }

  return (
    <SidebarProvider>
      {<AppSidebar/>}
      <main className="w-full m-2">
        <div className="border-sidebar-border bg-sidebar border shadow rounded-md overflow-y-scroll h-full p-4">
        <SidebarTrigger />
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default ProtectedLayout;
