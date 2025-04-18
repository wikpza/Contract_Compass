
import React from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import SidebarNav from './SidebarNav';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-business-50">
        <SidebarNav />
        <div className="flex-1 flex flex-col">
          <header className="border-b border-business-200 bg-white p-4 flex items-center sticky top-0 z-10">
            <SidebarTrigger className="mr-4 md:flex">
              <Menu className="h-5 w-5" />
            </SidebarTrigger>
            <h1 className="text-xl font-semibold text-business-800 truncate">
              {isMobile ? "Contract Compass" : "Contract Compass System"}
            </h1>
          </header>
          <main className="p-4 md:p-6 flex-1 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default Layout;
