"use client";

import { useEffect } from "react";
import { NotesProvider } from "@/contexts/NotesContext";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/app-sidebar";
import { StorageEngine } from "@/lib/storage-engine";

const Layout = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    StorageEngine.init();

    const handleOnline = () => {
      // Re-bootstrap on reconnection to ensure we didn't miss cloud changes
      StorageEngine.init();
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <NotesProvider>
      <SidebarProvider>
        <div className="flex h-screen w-screen overflow-hidden">
          <AppSidebar />
          <SidebarInset className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {children}
          </SidebarInset>
        </div>
      </SidebarProvider>
    </NotesProvider>
  );
};

export default Layout;