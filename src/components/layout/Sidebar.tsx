import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  FiHome,
  FiUsers,
  FiShoppingBag,
  FiX,
} from 'react-icons/fi';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: FiHome,
    roles: ['super_admin', 'admin', 'merchant'],
  },
  {
    name: 'Users',
    href: '/users',
    icon: FiUsers,
    roles: ['super_admin'],
  },
  {
    name: 'Merchants',
    href: '/merchants',
    icon: FiShoppingBag,
    roles: ['super_admin', 'admin'],
  },
];

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || '')
  );

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-all duration-300 ease-in-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-4 lg:px-6 border-b border-slate-200 shrink-0">
            <Link to="/dashboard" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-shadow">
                <span className="text-white font-bold text-sm">AD</span>
              </div>
              <span className="text-lg font-bold text-slate-900">AdminPanel</span>
            </Link>
            <button
              onClick={onToggle}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {filteredNavigation.map((item) => {
              const isActive = location.pathname.startsWith(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={onToggle}
                  className={cn(
                    'relative flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'w-5 h-5 mr-3 transition-colors',
                      isActive ? 'text-indigo-600' : 'text-slate-400'
                    )}
                  />
                  {item.name}
                  {isActive && (
                    <span className="absolute right-3 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>
    </>
  );
}

