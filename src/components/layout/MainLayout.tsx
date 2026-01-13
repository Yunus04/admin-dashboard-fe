import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

export function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex lg:overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex-1 flex flex-col min-h-screen w-0">
        <Header onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <Outlet />
        </main>

        <footer className="hidden lg:block px-8 py-4 border-t border-slate-200 bg-white shrink-0">
          <p className="text-sm text-slate-500 text-center">
            © 2024 AdminPanel. All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}

