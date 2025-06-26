"use client"
import { SidebarProvider } from "@/components/ui/sidebar";
import React, { useState } from "react";
import AppSidebar from "./_components/AppSidebar";
import AppHeader from "./_components/AppHeader";
import { VideoFrameContext } from "../_context/VideoFramesContext";

 

function DashboardProvider({ children }) {
  const [frameList, setFrameList] = useState([]);
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="w-full">
        <AppHeader />
        <div className='p-5'>
          <VideoFrameContext.Provider value={{frameList, setFrameList}}>
            {children}
          </VideoFrameContext.Provider>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default DashboardProvider;
