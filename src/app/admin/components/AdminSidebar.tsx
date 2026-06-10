'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: '📊' },
  { label: 'Pages', href: '/admin/pages', icon: '📄' },
  { label: 'Footer', href: '/admin/footer', icon: '📝' },
  { label: 'Home Page', href: '/admin/pages/home', icon: '🏠' },
  { label: 'Images', href: '/admin/images', icon: '🖼️' },
  // { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
  { label: 'Manage Jobs', href: '/admin/jobs', icon: '💼' },
  { label: 'Manage Offers', href: '/admin/offers', icon: '🎁' },
  { label: 'Manage Cities', href: '/admin/city', icon: '🌆' },
  { label: 'SEO Pages', href: '/admin/seo', icon: '🔍' },
  { label: 'Page Sections', href: '/admin/pages/sections', icon: '📚' },
  { label: 'Themes', href: '/admin/themes', icon: '🎨' },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  return (
    <aside
      className={`relative flex bg-slate-800 transition-all duration-300 ease-in-out
        w-full h-[80px] flex-row border-b border-slate-600 px-4 items-center justify-between shrink-0
        md:h-screen md:flex-col md:border-r md:border-b-0 md:px-0 md:items-stretch md:justify-start
        ${isOpen ? 'md:w-[280px]' : 'md:w-[80px]'}
      `}
    >
      {/* Sidebar Header */}
      <div className="flex items-center justify-between md:p-6 md:border-b border-slate-600 gap-4 w-full md:w-auto">
        <div className="flex items-center gap-3 font-bold text-xl text-blue-500 transition-all">
          <span className="text-2xl shrink-0">⚡</span>
          <span
            className={`transition-all duration-300 ease-in-out truncate md:block
              ${isOpen ? 'opacity-100 w-auto' : 'md:opacity-0 md:w-0'}
            `}
          >
            Admin
          </span>
        </div>
        <button
          className="hidden md:flex w-9 h-9 border border-slate-600 bg-slate-700 rounded-md text-slate-100 items-center justify-center transition-colors hover:bg-blue-500 hover:text-slate-900 hover:border-blue-500 shrink-0"
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle sidebar"
        >
          {isOpen ? '←' : '→'}
        </button>
      </div>

      {/* Navigation */}
      <nav className="hidden md:flex flex-1 p-4 flex-col gap-2 overflow-y-auto custom-scrollbar">
        {MENU_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 py-3 px-4 rounded-md text-slate-300 no-underline transition-all border-l-[3px] border-transparent cursor-pointer whitespace-nowrap
                hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500
                ${isActive ? 'bg-blue-500/15 text-blue-500 border-blue-500 font-semibold' : ''}
              `}
              title={item.label}
            >
              <span className="text-xl shrink-0">{item.icon}</span>
              <span
                className={`flex-1 transition-all duration-300 ease-in-out truncate overflow-hidden
                  ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
                `}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="hidden md:flex p-4 border-t border-slate-600 gap-2">
        <button className="flex-1 flex items-center gap-3 py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-md text-red-300 transition-colors text-sm whitespace-nowrap hover:bg-red-500/20 hover:border-red-500">
          <span className="shrink-0 text-lg">🚪</span>
          <span
            className={`transition-all duration-300 ease-in-out truncate overflow-hidden
              ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}
            `}
          >
            Logout
          </span>
        </button>
      </div>
    </aside>
  );
}