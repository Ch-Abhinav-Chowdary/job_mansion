import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import {
  BookOpen,
  CreditCard,
  User,
  ArrowRight,
  Clock,
  PlayCircle,
  Shield,
} from 'lucide-react';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ['myEnrollments'],
    queryFn: async () => {
      const res = await api.get('/users/me/enrollments');
      return res.data.data.enrollments;
    },
  });

  const { data: paymentsData, isLoading: paymentsLoading } = useQuery({
    queryKey: ['myPayments'],
    queryFn: async () => {
      const res = await api.get('/users/me/payments');
      return res.data.data.payments;
    },
  });

  const enrollments = enrollmentsData || [];
  const payments = paymentsData || [];

  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-8 md:py-12 space-y-8">
      {/* Welcome Banner */}
      <div className="p-6 md:p-8 rounded-md bg-surface border border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Student Dashboard
          </span>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-ink mt-1">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-muted mt-1">
            Access your course syllabi, watch video lessons, and manage your account.
          </p>
        </div>

        {isAdmin && (
          <Link to="/admin">
            <Button variant="secondary" size="sm" className="inline-flex items-center gap-1.5">
              <Shield size={16} /> Admin management
            </Button>
          </Link>
        )}
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-md bg-surface border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Enrolled Courses
            </span>
            <BookOpen size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {enrollmentsLoading ? '...' : enrollments.length}
          </span>
        </div>

        <div className="p-5 rounded-md bg-surface border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Completed Payments
            </span>
            <CreditCard size={18} className="text-primary" />
          </div>
          <span className="text-2xl font-display font-bold text-ink">
            {paymentsLoading
              ? '...'
              : payments.filter((p) => p.status === 'paid').length}
          </span>
        </div>

        <div className="p-5 rounded-md bg-surface border border-border">
          <div className="flex items-center justify-between text-muted mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Student Profile
            </span>
            <User size={18} className="text-primary" />
          </div>
          <span className="text-sm font-semibold text-ink truncate block">
            {user?.email}
          </span>
        </div>
      </div>

      {/* Enrolled Courses Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-ink">
            My active courses
          </h2>
          {enrollments.length > 0 && (
            <Link
              to="/my-courses"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              View all <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {enrollmentsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="h-40 rounded-md border border-border bg-surface animate-pulse"
              />
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No active course enrollments"
            description="You have not enrolled in any training programs yet. Explore our software development cohorts to get started."
            action={
              <Link to="/courses">
                <Button variant="primary">Browse course catalog</Button>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {enrollments.map((item) => {
              const course = item.course;
              if (!course) return null;

              return (
                <div
                  key={item._id}
                  className="rounded-md border border-border bg-surface p-5 flex flex-col justify-between hover:border-primary transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge variant="category">{course.category || 'Course'}</Badge>
                      <Badge variant="active">Enrolled</Badge>
                    </div>

                    <h3 className="text-lg font-display font-semibold text-ink">
                      {course.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Clock size={13} />
                        {course.duration}
                      </span>
                      <span className="uppercase font-medium">
                        {course.mode}
                      </span>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-border flex items-center justify-between">
                    <span className="text-xs text-muted">
                      Enrolled on {new Date(item.enrolledAt).toLocaleDateString('en-IN')}
                    </span>
                    <Link to={`/learn/${course.slug}`}>
                      <Button variant="primary" size="sm" className="inline-flex items-center gap-1.5">
                        <PlayCircle size={15} /> Resume lessons
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Payments Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold text-ink">
            Payment history
          </h2>
          {payments.length > 0 && (
            <Link
              to="/payments"
              className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1"
            >
              All payments <ArrowRight size={14} />
            </Link>
          )}
        </div>

        {paymentsLoading ? (
          <div className="h-28 rounded-md bg-surface border border-border animate-pulse" />
        ) : payments.length === 0 ? (
          <div className="p-6 rounded-md bg-surface border border-border text-center text-sm text-muted">
            No transaction records found.
          </div>
        ) : (
          <div className="rounded-md border border-border bg-surface overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-bg/50 border-b border-border">
                <tr>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Course</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Date</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Amount</th>
                  <th className="px-4 py-2.5 text-xs font-medium text-muted">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.slice(0, 3).map((p) => (
                  <tr key={p._id} className="hover:bg-primary-soft/40 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink">
                      {p.course?.title || 'Course Enrollment'}
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {new Date(p.createdAt).toLocaleDateString('en-IN')}
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink">
                      {formatPrice(p.amount)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={p.status}>{p.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
