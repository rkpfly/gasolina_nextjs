// app/admin/layout.tsx
import React from 'react';
import { AdminSidebar } from './components/AdminSidebar';
import { LogoutButton } from './components/LogoutButton';

export const metadata = {
  title: 'Admin Panel',
  description: 'Content management dashboard',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Outer wrapper: Column on mobile (top nav), Row on desktop (side nav), full height
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-900 text-slate-100 font-sans">
      <AdminSidebar />
      
      {/* Main Container: takes up remaining space, handles its own scrolling */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Admin Header */}
        <header className="sticky top-0 z-10 flex justify-between items-center p-4 md:px-8 md:py-6 border-b border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900 backdrop-blur-md shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-br from-blue-500 to-purple-500 bg-clip-text text-transparent">
            Content Management
          </h1>
          
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-2 text-sm text-slate-300 px-3 py-1.5 md:px-4 md:py-2 bg-emerald-500/10 rounded-md border border-emerald-500/30">
              <span className="text-emerald-500 text-[10px]">●</span> Live
            </span>
            <LogoutButton />
          </div>
        </header>
        
        {/* Admin Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
        
      </main>
    </div>
  );
}