import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, X, Shield, User, BookOpen, LogOut } from 'lucide-react';
import Button from '../ui/Button';

/**
 * Two-bar house gable SVG per DESIGN.md:
 * "Wordmark in Bricolage 700, primary, with a simple two-bar house-gable SVG (geometry, not clip art)"
 */
export const Logo = () => (
  <Link to="/" className="flex items-center gap-2 group">
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-primary shrink-0 transition-transform duration-150 group-hover:-translate-y-0.5"
    >
      {/* Outer gable bar */}
      <path d="M3 10.5L12 3.5L21 10.5" />
      {/* Inner gable bar */}
      <path d="M6.5 14L12 9.5L17.5 14" />
    </svg>
    <span className="font-display font-bold text-xl text-primary tracking-tight">
      Job Mansion
    </span>
  </Link>
);

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setMobileOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors duration-150 ${
      isActive
        ? 'text-primary font-semibold'
        : 'text-muted hover:text-ink'
    }`;

  const mobileLinkClass = ({ isActive }) =>
    `block py-2 text-base font-medium rounded-sm px-3 ${
      isActive
        ? 'bg-primary-soft text-primary font-semibold'
        : 'text-ink hover:bg-bg'
    }`;

  return (
    <header className="sticky top-0 z-40 w-full h-16 bg-surface border-b border-border shadow-sm">
      <div className="max-w-[1120px] mx-auto h-full px-5 md:px-8 flex items-center justify-between">
        {/* Brand */}
        <Logo />

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
          <NavLink to="/courses" className={navLinkClass}>
            Courses
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            About
          </NavLink>
          <NavLink to="/contact" className={navLinkClass}>
            Contact
          </NavLink>
        </nav>

        {/* Desktop Auth Controls */}
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-ink hover:text-primary transition-colors px-3 py-2"
              >
                Log in
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Register
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-sm bg-accent-soft text-ink hover:bg-accent hover:text-ink transition-colors"
                >
                  <Shield size={14} strokeWidth={2} />
                  Admin portal
                </Link>
              )}

              <NavLink
                to="/dashboard"
                className="text-sm font-medium text-ink hover:text-primary transition-colors px-2 py-1.5 rounded-sm"
              >
                Dashboard
              </NavLink>

              <NavLink
                to="/my-courses"
                className="text-sm font-medium text-ink hover:text-primary transition-colors px-2 py-1.5 rounded-sm inline-flex items-center gap-1"
              >
                <BookOpen size={16} strokeWidth={1.75} />
                My courses
              </NavLink>

              <NavLink
                to="/profile"
                className="text-sm font-medium text-ink hover:text-primary transition-colors px-2 py-1.5 rounded-sm inline-flex items-center gap-1"
                title={user?.email}
              >
                <User size={16} strokeWidth={1.75} />
                Profile
              </NavLink>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-muted hover:text-error"
                title="Log out"
              >
                <LogOut size={16} strokeWidth={1.75} />
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center">
          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            className="p-2 text-ink rounded-sm hover:bg-bg transition-colors"
          >
            {mobileOpen ? <X size={24} strokeWidth={1.75} /> : <Menu size={24} strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="md:hidden border-b border-border bg-surface px-5 py-4 space-y-2 shadow-md">
          <NavLink
            to="/courses"
            className={mobileLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            Courses
          </NavLink>
          <NavLink
            to="/about"
            className={mobileLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            About
          </NavLink>
          <NavLink
            to="/contact"
            className={mobileLinkClass}
            onClick={() => setMobileOpen(false)}
          >
            Contact
          </NavLink>

          <div className="pt-3 border-t border-border space-y-2">
            {!isAuthenticated ? (
              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium border border-border-strong rounded-sm text-ink hover:bg-primary-soft transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileOpen(false)}
                  className="w-full text-center py-2 text-sm font-medium bg-primary text-white rounded-sm hover:bg-primary-hover transition-colors"
                >
                  Register
                </Link>
              </div>
            ) : (
              <>
                {isAdmin && (
                  <NavLink
                    to="/admin"
                    className={mobileLinkClass}
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="inline-flex items-center gap-1.5 font-semibold text-accent-hover">
                      <Shield size={16} strokeWidth={2} />
                      Admin portal
                    </span>
                  </NavLink>
                )}
                <NavLink
                  to="/dashboard"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </NavLink>
                <NavLink
                  to="/my-courses"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  My courses
                </NavLink>
                <NavLink
                  to="/profile"
                  className={mobileLinkClass}
                  onClick={() => setMobileOpen(false)}
                >
                  Profile ({user?.name || user?.email})
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-full text-left py-2 text-base font-medium rounded-sm px-3 text-error hover:bg-error-soft transition-colors inline-flex items-center gap-1.5"
                >
                  <LogOut size={16} strokeWidth={1.75} />
                  Log out
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
