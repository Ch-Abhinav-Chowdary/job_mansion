import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../../api/axios';
import { formatPrice } from '../../utils/format';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { CreditCard, CheckCircle2, ShieldCheck } from 'lucide-react';

const Payments = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['myPaymentsList'],
    queryFn: async () => {
      const res = await api.get('/users/me/payments');
      return res.data.data.payments;
    },
  });

  const payments = data || [];

  return (
    <div className="max-w-[1120px] mx-auto px-5 md:px-8 py-8 md:py-12 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-ink">
          Payment history & invoices
        </h1>
        <p className="text-sm text-muted mt-1">
          Review your Razorpay transactions, course receipts, and payment statuses.
        </p>
      </div>

      {isLoading ? (
        <div className="h-64 rounded-md bg-surface border border-border animate-pulse" />
      ) : payments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title="No transaction records"
          description="You have not initiated any course payments yet. Select a course to begin enrollment."
          action={
            <Link to="/courses">
              <Button variant="primary">Browse course catalog</Button>
            </Link>
          }
        />
      ) : (
        <div className="rounded-md border border-border bg-surface overflow-x-auto shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-bg/60 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Course / Item
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Order ID
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Payment ID
                </th>
                <th className="px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payments.map((p) => (
                <tr
                  key={p._id}
                  className="hover:bg-primary-soft/40 transition-colors"
                >
                  <td className="px-4 py-3.5 font-medium text-ink">
                    {p.course?.title || 'Course Enrollment'}
                  </td>
                  <td className="px-4 py-3.5 text-xs text-muted whitespace-nowrap">
                    {new Date(p.createdAt).toLocaleDateString('en-IN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-ink">
                    {formatPrice(p.amount)}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted">
                    {p.razorpayOrderId}
                  </td>
                  <td className="px-4 py-3.5 text-xs font-mono text-muted">
                    {p.razorpayPaymentId || '—'}
                  </td>
                  <td className="px-4 py-3.5">
                    <Badge variant={p.status}>{p.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="p-4 bg-bg/40 border-t border-border flex items-center justify-between text-xs text-muted">
            <span>Payments securely verified via Razorpay HMAC SHA256 signatures</span>
            <div className="flex items-center gap-1.5 text-ink font-medium">
              <ShieldCheck size={16} className="text-primary" />
              Direct payment receipts
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payments;
