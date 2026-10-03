import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Activity, Settings, Zap, LogOut, X } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/smarthen-logo.png';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
  { to: '/readings', label: 'Readings', icon: <Activity className="h-4 w-4" /> },
  { to: '/controls', label: 'Controls', icon: <Zap className="h-4 w-4" /> },
  { to: '/settings', label: 'Settings', icon: <Settings className="h-4 w-4" /> },
];

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuth();

  const displayName = admin?.name || 'Admin';
  const userEmail = admin?.email || '';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} />}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 flex-col border-r border-neutral-200 bg-white transition-transform md:flex ${
          isOpen ? 'flex translate-x-0' : '-translate-x-full'
        } md:translate-x-0`}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center justify-between border-b border-neutral-200 px-4">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src={logo} alt="Smarthen" className="h-9 w-9 rounded-lg object-contain" />
            <span className="text-lg font-bold text-neutral-900">Smarthen</span>
          </Link>
          <button className="md:hidden" onClick={onClose}>
            <X className="h-5 w-5 text-neutral-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Menu
          </p>
          {navItems.map((item) => {
            const isActive = pathname === item.to || pathname.startsWith(item.to + '/');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => onClose()}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="h-4 w-4 shrink-0">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User area */}
        <div className="border-t border-neutral-200 p-3">
          <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
            <Avatar name={displayName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-neutral-900">{displayName}</p>
              <p className="truncate text-xs text-neutral-500">{userEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="text-neutral-400 transition-colors hover:text-neutral-700"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
