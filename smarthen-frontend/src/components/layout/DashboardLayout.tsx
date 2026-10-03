import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { admin } = useAuth();

  const displayName = admin?.name || 'Admin';

  return (
    <div className="flex min-h-screen bg-neutral-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex flex-1 flex-col md:ml-64 w-full max-w-full overflow-x-hidden">
        {/* Header */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-neutral-200 bg-white px-4 md:px-6">
          <div className="flex items-center gap-2">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5 text-neutral-600" />
            </button>
            <Link to="/dashboard" className="md:hidden">
              <span className="text-lg font-bold text-primary-600">Smarthen</span>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden text-sm text-neutral-600 sm:block">{displayName}</span>
            <Avatar name={displayName} size="sm" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
