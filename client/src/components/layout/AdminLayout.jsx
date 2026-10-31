import { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CreditCard,
  MessageSquare,
  ArrowLeft,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/courses', label: 'Courses', icon: BookOpen },
    { to: '/admin/students', label: 'Students', icon: Users },
    { to: '/admin/payments', label: 'Payments', icon: CreditCard },
    { to: '/admin/enquiries', label: 'Enquiries', icon: MessageSquare },
  ];

  const linkClass = ({ isActive }) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-sm text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primary text-white font-semibold shadow-xs'
        : 'text-ink hover:bg-primary-soft hover:text-primary'
    }`;

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row text-ink">
      {/* Mobile top bar */}
      <header className="md:hidden bg-surface border-b border-border h-16 px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-primary" />
          <span className="font-display font-bold text-lg text-ink">Admin Portal</span>
        </div>
        <button
          type="button"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-ink rounded-sm hover:bg-bg"
          aria-label="Toggle navigation"
        >
          {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>

      {/* Admin Sidebar */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-surface border-r border-border p-5 flex flex-col justify-between transition-transform duration-200 ease-out md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0 shadow-md' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M3 10.5L12 3.5L21 10.5" />
                <path d="M6.5 14L12 9.5L17.5 14" />
              </svg>
              <span className="font-display font-bold text-lg text-primary tracking-tight">
                Job Mansion
              </span>
            </Link>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-sm bg-accent-soft text-ink">
              Admin
            </span>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={() => setSidebarOpen(false)}
                  className={linkClass}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="pt-4 border-t border-border space-y-2 text-sm">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 text-muted hover:text-ink transition-colors rounded-sm"
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Back to main site
          </Link>
          <div className="px-3 py-1 text-xs text-muted truncate">
            {user?.name || user?.email}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 text-error hover:bg-error-soft rounded-sm transition-colors text-left"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Overlay backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-5 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
