import type { ReactNode } from 'react';
import { Package, Menu } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-surface/50 hidden md:flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <span className="bg-accentOrange text-white p-1 rounded-md"><Package size={20} /></span>
            Inventory OS
          </h1>
        </div>
        <nav className="flex-1 px-4 flex flex-col gap-2">
          <button className="flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm font-medium bg-surfaceHover text-textMain">
            <Package size={18} className="text-accentBlue" />
            Inventory Dashboard
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-14 border-b border-border flex items-center px-4 md:hidden">
          <button className="p-2 -ml-2 text-textMuted">
            <Menu size={24} />
          </button>
          <span className="font-semibold ml-2">Inventory OS</span>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto space-y-12">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
