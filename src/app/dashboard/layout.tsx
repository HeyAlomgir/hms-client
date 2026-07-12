import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import React from "react"; 


interface DashBoardLayoutProps {
  children: React.ReactNode;
}

export default function DashBoardLayout({ children }: DashBoardLayoutProps): React.JSX.Element {
  return (
    <div className="flex h-screen w-screen bg-background overflow-hidden">
      {/* sidebar */}
      <DashboardSidebar />

      {/* right side */}
      <div className="flex flex-col flex-1 h-full overflow-hidden">
        
        {/* dashboard nav */}
        <header className="border-b border-divider w-full p-4 flex items-center justify-between bg-content1/50 backdrop-blur-md">
          <div className="font-semibold text-sm">Dashboard</div>
        </header>

        {/* dynamic content */}
        <main className="flex-1 overflow-y-auto p-6 bg-background">
          {children}
        </main>
      </div>
    </div>
  );
}