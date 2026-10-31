import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Button from '../../components/ui/Button';
import {
  Users,
  IndianRupee,
  BookOpen,
  MessageSquare,
  Plus,
  ArrowRight,
  TrendingUp,
  CreditCard,
} from 'lucide-react';

const AdminDashboard = () => {
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await api.get('/admin/stats');
      return res.data.data;
    },
  });

  const { data: recentEnquiries } = useQuery({
    queryKey: ['recentEnquiries'],
    queryFn: async () => {
      const res = await api.get('/admin/enquiries?limit=5');
      return res.data.data.enquiries || [];
    },
  });

  const stats = statsData || {
    totalStudents: 0,
    totalRevenuePaise: 0,
    activeEnrollments: 0,
    newEnquiries: 0,
    totalCourses: 0,
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Management Overview
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
            Admin Dashboard
          </h1>
          <p className="text-sm text-muted mt-0.5">
            Key metrics, revenue tracking, and admissions activity.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/admin/courses/new">
            <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
              <Plus size={16} /> Create course
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row (4 primary cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-md bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Students
            </span>
            <Users size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {statsLoading ? '...' : stats.totalStudents}
          </span>
          <span className="text-xs text-muted block mt-1">Registered users</span>
        </div>

        <div className="p-5 rounded-md bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Total Revenue
            </span>
            <IndianRupee size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {statsLoading ? '...' : formatPrice(stats.totalRevenuePaise)}
          </span>
          <span className="text-xs text-muted block mt-1">From verified payments</span>
        </div>

        <div className="p-5 rounded-md bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Active Enrollments
            </span>
            <BookOpen size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {statsLoading ? '...' : stats.activeEnrollments}
          </span>
          <span className="text-xs text-muted block mt-1">Across all cohorts</span>
        </div>

        <div className="p-5 rounded-md bg-surface border border-border shadow-xs">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              New Enquiries
            </span>
            <MessageSquare size={18} className="text-accent" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {statsLoading ? '...' : stats.newEnquiries}
          </span>
          <span className="text-xs text-muted block mt-1">Awaiting follow-up</span>
        </div>
      </div>

      {/* Two Column Section: Quick Actions & Recent Enquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Recent Enquiries */}
        <div className="lg:col-span-8 p-6 rounded-md bg-surface border border-border shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-display font-semibold text-ink">
              Recent admissions enquiries
            </h2>
            <Link
              to="/admin/enquiries"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              All enquiries <ArrowRight size={14} />
            </Link>
          </div>

          {recentEnquiries?.length === 0 ? (
            <p className="text-sm text-muted py-4">No recent enquiries recorded.</p>
          ) : (
            <div className="divide-y divide-border">
              {recentEnquiries?.slice(0, 5).map((enq) => (
                <div key={enq._id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-ink">{enq.name}</h4>
                    <p className="text-xs text-muted">
                      {enq.email} • {enq.phone}
                    </p>
                    <p className="text-xs text-ink mt-1 line-clamp-1">
                      "{enq.message}"
                    </p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-sm capitalize shrink-0 ${
                      enq.status === 'new'
                        ? 'bg-accent-soft text-ink'
                        : 'bg-primary-soft text-primary'
                    }`}
                  >
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Quick Navigation Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-5 rounded-md bg-surface border border-border shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">
              Management shortcuts
            </h3>
            <div className="space-y-2">
              <Link
                to="/admin/courses"
                className="flex items-center justify-between p-3 rounded-sm bg-bg hover:bg-primary-soft text-sm font-medium text-ink transition-colors"
              >
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" /> Manage Courses
                </span>
                <ArrowRight size={14} className="text-muted" />
              </Link>

              <Link
                to="/admin/students"
                className="flex items-center justify-between p-3 rounded-sm bg-bg hover:bg-primary-soft text-sm font-medium text-ink transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Users size={16} className="text-primary" /> Manage Students
                </span>
                <ArrowRight size={14} className="text-muted" />
              </Link>

              <Link
                to="/admin/payments"
                className="flex items-center justify-between p-3 rounded-sm bg-bg hover:bg-primary-soft text-sm font-medium text-ink transition-colors"
              >
                <span className="flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" /> Review Payments
                </span>
                <ArrowRight size={14} className="text-muted" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
