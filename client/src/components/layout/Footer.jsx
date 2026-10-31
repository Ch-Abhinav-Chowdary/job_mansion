import { Link } from 'react-router-dom';
import { Logo } from './Navbar';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-surface border-t border-border mt-auto">
      <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand col */}
          <div className="md:col-span-2 space-y-3">
            <Logo />
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Software training built for careers in India. Practical syllabi, real code, and transparent pricing.
            </p>
          </div>

          {/* Courses links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Training
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses" className="text-ink hover:text-primary transition-colors">
                  All courses
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Full+Stack" className="text-muted hover:text-primary transition-colors">
                  Full stack web development
                </Link>
              </li>
              <li>
                <Link to="/courses?category=Backend" className="text-muted hover:text-primary transition-colors">
                  Backend & systems
                </Link>
              </li>
              <li>
                <Link to="/courses?category=DevOps" className="text-muted hover:text-primary transition-colors">
                  DevOps & cloud
                </Link>
              </li>
            </ul>
          </div>

          {/* Institute links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-muted uppercase tracking-wider">
              Institute
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/about" className="text-ink hover:text-primary transition-colors">
                  About us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-ink hover:text-primary transition-colors">
                  Contact & enquiries
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-muted hover:text-primary transition-colors">
                  Student login
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {currentYear} Job Mansion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span>Prices stored in paise, charged in INR</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
